import React from 'react';
import BlueSquare from './BlueSquares';
import ToggleSwitch from './UserProfileEdit/ToggleSwitch';
import './UserProfile.scss';
import './UserProfileEdit/UserProfileEdit.scss';
import { Button } from 'react-bootstrap';
import ScheduleReasonModal from './ScheduleReasonModal/ScheduleReasonModal';
import { useState } from 'react';
import { useReducer } from 'react';
import Spinner from 'react-bootstrap/Spinner';

const BlueSquareLayout = props => {
  const fetchingReducer = (state, action) => {
    switch (action.type) {
      case 'FETCHING_STARTED':
        return { ...state, isFetching: true };
      case 'ERROR':
        return { isFetching: false, error: true, success: false };
      case 'SUCCESS':
        return { isFetching: false, error: false, success: true };
    }
  };

  const {
    userProfile,
    handleUserProfile,
    handleBlueSquare,
    isUserSelf,
    role,
    roles,
    userPermissions,
    canEdit,
  } = props;
  const { privacySettings } = userProfile;
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState('');
  const [fetchState, fetchDispatch] = useReducer(fetchingReducer, {
    isFetching: false,
    error: false,
    success: false,
  });

  const handleToggle = () => {
    setShow(prev => !prev);
  };

  const handleSubmit = event => {
    event.preventDefault();
    setShow(false)
    fetchDispatch({ type: 'FETCHING_STARTED' });
    setTimeout(() => {
      fetchDispatch({type: 'ERROR'})
      setShow(true)
    }, 4000)
  };

  if (canEdit) {
    return (
      <div data-testid="blueSqaure-field">
        <div className="blueSquare-toggle">
          <div style={{ display: 'inline-block' }}>BLUE SQUARES</div>
          {canEdit ? (
            <ToggleSwitch
              style={{ display: 'inline-block' }}
              switchType="bluesquares"
              state={privacySettings?.blueSquares}
              handleUserProfile={handleUserProfile}
            />
          ) : null}
        </div>

        <BlueSquare
          blueSquares={userProfile?.infringements}
          handleBlueSquare={handleBlueSquare}
          role={role}
          roles={roles}
          userPermissions={userPermissions}
        />
        <div className="mt-4 w-100">
          <Button variant="primary" onClick={handleToggle} className="w-100" size="md">
            {fetchState.isFetching ? <Spinner size='sm' animation='border' />:'Schedule Blue Square Reason'}
          </Button>
        </div>
        {show && (
          <ScheduleReasonModal
            show={show}
            handleToggle={handleToggle}
            user={userProfile}
            reason={reason}
            setReason={setReason}
            handleSubmit={handleSubmit}
            fetchState={fetchState}
          />
        )}
      </div>
    );
  }
  return (
    <div>
      {!privacySettings?.blueSquares ? (
        <p>Blue Square Info is Private</p>
      ) : (
        <div>
          <p>BLUE SQUARES</p>
          <BlueSquare
            blueSquares={userProfile?.infringements}
            handleBlueSquare={handleBlueSquare}
            role={role}
            userPermissions={userPermissions}
            roles={roles}
          />
        </div>
      )}
    </div>
  );
};

export default BlueSquareLayout;
