import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import httpService from '../../services/httpService';
import { ENDPOINTS } from 'utils/URL';
import { useSelector } from 'react-redux';

const SetupNewUserPopup = React.memo(props => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [email, setEmail] = useState('');
  const [weeklyCommittedHours, setWeeklyCommittedHours] = useState('0');
  const [alert, setAlert] = useState({ visibility: 'hidden', message: '', state: 'success' });
  const patt = RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
  const baseUrl = window.location.origin;

  const closePopup = e => {
    props.onClose();
  };

  const handelSendLink = () => {
    setAlert({ visibility: 'hidden', message: '', state: 'success' });
    if (!email.match(patt)) {
      {
        setAlert({ visibility: 'visible', message: 'Please enter a valid email.', state: 'error' });
      }
    } else if (weeklyCommittedHours < 0) {
      {
        setAlert({
          visibility: 'visible',
          message: 'Weekly committed hours should be positive number.',
          state: 'error',
        });
      }
    } else {
      httpService
        .post(ENDPOINTS.SETUP_NEW_USER(), { baseUrl, email, weeklyCommittedHours })
        .then(res => {
          if (res.status === 200) {
            setAlert({
              visibility: 'visible',
              message: 'The setup link has been successfully sent',
              state: 'success',
            });
            // console.log(res.data);
          } else {
            setAlert({ visibility: 'visible', message: 'An error has occurred', state: 'error' });
          }
        })
        .catch(err => {
          if (err.response.data === 'email already in use') {
            setAlert({
              visibility: 'visible',
              message: 'This email is associated with an existing user account.',
              state: 'error',
            });
          } else {
            setAlert({ visibility: 'visible', message: 'An error has occurred', state: 'error' });
          }
        })
        .finally(() => {
          setTimeout(() => {
            setAlert({ visibility: 'hidden', message: '', state: 'success' });
            setEmail('');
            setWeeklyCommittedHours(0);
          }, 2000);
        });
    }
  };
  const handleCommitedHoursChange = e => { 
      let val = Number(e.target.value)
      if (val > 168) {
        setWeeklyCommittedHours('168');
      } else if (val < 0 ) {
        setWeeklyCommittedHours('0');
      } else {
        setWeeklyCommittedHours(val.toString());
      }
  }

  return (
    <Modal isOpen={props.open} toggle={closePopup} className={`modal-dialog modal-lg ${darkMode ? 'text-light' : ''}`}>
      <ModalHeader
        toggle={closePopup}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
        className={darkMode ? 'bg-space-cadet' : ''}
      >
        Setup New User
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className="setup-new-user-popup-section">
          <label htmlFor="email" className={`setup-new-user-popup-label ${darkMode ? 'text-light' : ''}`}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={e => {
              setEmail(e.target.value.toLocaleLowerCase());
            }}
            className="form-control setup-new-user-popup-input"
            placeholder="Please enter the email address for the new user"
          />
          <input
            type="number"
            name="weeklyCommittedHours"
            min={0}
            max={168}
            value={weeklyCommittedHours}
            onKeyDown={e=>{if(e.key === 'Backspace' || e.key === 'Delete'){setWeeklyCommittedHours('');}}}
            onChange={handleCommitedHoursChange}
            className="form-control setup-new-user-popup-input"
            placeholder="weekly committed hours"
          />
          <button
            className="btn btn-primary"
            id="setup-new-user-popup-btn"
            onClick={handelSendLink}
          >
            Send Link
          </button>
          <div
            className={`setup-new-user-popup-${alert.state}`}
            style={{ visibility: alert.visibility }}
          >
            {alert.message}
          </div>
        </div>
      </ModalBody>
      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default SetupNewUserPopup;
