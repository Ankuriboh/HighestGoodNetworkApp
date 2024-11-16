import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPresetsByRole } from '../../../actions/rolePermissionPresets';
import { updateUserProfileProperty } from '../../../actions/userProfile';
import { permissionLabels } from '../../PermissionsManagement/PermissionsConst';
import './PermissionChangeModal.css';
import '../../../App.css';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import { toast } from 'react-toastify';

function PermissionChangeModal({ 
  userProfile, 
  setUserProfile, 
  isOpen, 
  closeModal,
  potentialRole,
  oldRolePermissions,
  currentUserPermissions,
  permissionLabelPermissions
}) {
  // Creating a modal that pops up when someone changes a user's role
  // and the user has custom permissions that differ from the permissions
  // of their old role. It should show the difference between the current permissions of the user
  // and the permissions of the new role, and ask the user to confirm which permissions they want
  // to keep.

  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [checkedAddedPermissions, setCheckedAddedPermissions] = useState({});
  const [checkedRemovedPermissions, setCheckedRemovedPermissions] = useState({});

  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const newRole = potentialRole;

  useEffect(() => {
    const fetchNewRolePermissions = async () => {
      if (newRole) {
        const newRolePresets = await dispatch(getPresetsByRole(newRole));
        if (newRolePresets && newRolePresets.presets && newRolePresets.presets[2]) {
          // setNewRolePermissions(newRolePresets.presets[2].permissions);
          // const validPermissions = getValidPermissions(permissionLabels);
          const filteredPermissions = newRolePresets.presets[2].permissions.filter(permission => permissionLabelPermissions.has(permission));
          setNewRolePermissions(filteredPermissions);
        }
      }
    };

    fetchNewRolePermissions();
  }, [dispatch, newRole]);

  // difference between old role permissions and user permissions
  // permissions that were added to user (user permissions - old role permissions)
  const customAddedPermissions = useMemo(() => {
    return currentUserPermissions.filter(permission => !oldRolePermissions.includes(permission));
  }, [currentUserPermissions, oldRolePermissions]);
  // permissions that were removed from user (old role permissions - user permissions)
  const customRemovedPermissions = useMemo(() => {
    return oldRolePermissions.filter(permission => !currentUserPermissions.includes(permission));
  }, [oldRolePermissions, currentUserPermissions]);
  // permissions that were removed from user but are in new role (newRolePermissions - customRemovedPermissions)
  const newRolePermissionsToAdd = useMemo(() => {
    return newRolePermissions.filter(permission => customRemovedPermissions.includes(permission));
  }, [newRolePermissions, customRemovedPermissions]);
  // permissions that were added to user but are not in new role (newRolePermissions + customAddedPermissions)
  const newRolePermissionsToRemove = useMemo(() => {
    return customAddedPermissions.filter(permission => !newRolePermissions.includes(permission));
  }, [customAddedPermissions, newRolePermissions]);

  const formatPermission = permission => {
    // find the permission in the permissionLabels array, then subperms array
    /* for (let label of permissionLabels) {
      for (let subperm of label.subperms) { */
        // if the key matches the permission, return the label
        /* if (subperm.key === permission) {
          return subperm.label;
        }
      }
    } */
    // if the permission is not found in the permissionLabels array, return the permission
    /* return permission; */
    const findPermissionLabel = (perms) => {
      for (let perm of perms) {
        if (perm.key === permission) {
          return perm.label;
        }
        if (perm.subperms) {
          const label = findPermissionLabel(perm.subperms);
          if (label) {
            return label;
          }
        }
      }
      return null;
    };
  
    const label = findPermissionLabel(permissionLabels);
    return label || permission;
  };

  useEffect(() => {
    if (isOpen) {
      const initialCheckedAddedPermissions = {};
      const initialCheckedRemovedPermissions = {};

      newRolePermissionsToAdd.forEach(permission => {
        initialCheckedRemovedPermissions[permission] = true;
      });
      newRolePermissionsToRemove.forEach(permission => {
        initialCheckedAddedPermissions[permission] = true;
      });
      setCheckedRemovedPermissions(initialCheckedRemovedPermissions);
      setCheckedAddedPermissions(initialCheckedAddedPermissions);
    }
  }, [isOpen, newRolePermissionsToAdd, newRolePermissionsToRemove]);

  const togglePermission = (permission, type) => {
    if (type === 'added') {
      setCheckedAddedPermissions(prevState => ({
        ...prevState,
        [permission]: !prevState[permission],
      }));
    } else {
      setCheckedRemovedPermissions(prevState => ({
        ...prevState,
        [permission]: !prevState[permission],
      }));
    }
  };

  const confirmModal = async () => {
    try {
      const updatedPermissions = [
        // ...currentUserPermissions.filter(permission => !checkedRemovedPermissions[permission]),
        ...newRolePermissions.filter(permission => !checkedRemovedPermissions[permission]),
        // ...newRolePermissionsToRemove.filter(permission => checkedAddedPermissions[permission])
        ...Object.keys(checkedAddedPermissions).filter(permission => checkedAddedPermissions[permission])
      ];
      
      const response = await dispatch(updateUserProfileProperty(userProfile, 'role', newRole));

      if (response === 200) {        
        setUserProfile({ 
          ...userProfile, 
          role: newRole,
          permissions: {
            ...userProfile.permissions,
            // frontPermissions: [
              // for each added permission, add it to the user's permissions if it's checked
              // for each removed permission, remove it from the user's permissions if it has an x mark
            // ]
            frontPermissions: updatedPermissions
          }
        });
        toast.success('User role successfully updated');
        closeModal();
      }
    } catch (error) {
      console.error('Error updating user role: ', error);
      toast.error('Error updating user role');
    }
  };

  return (
    <div>
    <Modal isOpen={isOpen} toggle={closeModal} className={darkMode ? 'text-light dark-mode' : ''}>
      <ModalHeader toggle={closeModal} className={darkMode ? 'bg-space-cadet' : ''}>
        Change User Role
      </ModalHeader>
      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p>
          You are changing the role of a Special Person with special permissions. This person has
          the following permissions that are different from the {newRole} role you are
          changing them to. Please confirm which of these you&apos;d like to keep:
        </p>
        <ul className="list">
          {newRolePermissionsToRemove.map(permission => (
            <li key={permission} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <input 
                type="checkbox" 
                id={permission} 
                name={permission} 
                value={permission}
                checked={!!checkedAddedPermissions[permission]}
                onChange={() => togglePermission(permission, 'added')}
                className="custom-checkbox" 
              />
              <label className={darkMode ? "permission-text-dark-mode permission-text" : "permission-text"} htmlFor={permission}>{formatPermission(permission)}</label> (Added)
            </li>
          ))}
          {newRolePermissionsToAdd.map(permission => (
            <li key={permission} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <input 
                type="checkbox" 
                id={permission} 
                name={permission} 
                value={permission} 
                checked={!!checkedRemovedPermissions[permission]}
                onChange={() => togglePermission(permission, 'removed')}
                className="custom-checkbox"
              />
              <label className={darkMode ? "permission-text-dark-mode permission-text" : "permission-text"} htmlFor={permission}>{formatPermission(permission)}</label> (Removed)
            </li>
          ))}
        </ul>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button color="secondary" onClick={closeModal}>Cancel</Button>
          <Button color="primary" onClick={confirmModal}>Confirm</Button>
        </ModalFooter>
    </Modal>
    </div>
  );
}

export default PermissionChangeModal;
