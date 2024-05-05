import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import './UpdateReusable.css';
import UpdateReusable from './UpdateReusable';

function UpdateReusableModal({ modal, setModal, record }) {
  if (record) {
    console.log('DEBUG: Update Reusable');
    console.log(record);
    const toggle = () => {
      setModal(false);
    };

    return (
      <Modal isOpen={modal} size="md">
        <ModalHeader>Update Reusable Form</ModalHeader>
        <ModalBody>
          <div className="updateModalContainer">
            <UpdateReusable record={record} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggle}>Close</Button>
        </ModalFooter>
      </Modal>
    );
  }
  return null;
}

export default UpdateReusableModal;
