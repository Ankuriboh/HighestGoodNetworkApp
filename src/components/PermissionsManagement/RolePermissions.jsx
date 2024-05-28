import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import permissionLabel from './PermissionsConst';
import PermissionList from './PermissionList';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Alert } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { updateRole, getAllRoles } from '../../actions/role';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import PermissionsPresetsModal from './PermissionsPresetsModal.jsx';
import { getPresetsByRole, createNewPreset } from 'actions/rolePermissionPresets';
import hasPermission from '../../utils/permissions';

function RolePermissions(props) {
  const modalInfo = {
    'See Only Weekly Summary Reports Tab':
      'Make the "Other Links" -> "Reports" button appear/accessible.',
    'See User Management Tab (Full Functionality)':
      'Make the "Other Links" -> "User Management" button appear/accessible and be able to create, delete, and update users.',
      'See Badge Management Tab (Full Functionality)':
      'Make the "Other Links" -> "Badge Management" button appear and then have the ability to create, delete, and update badges. ',
    'Delete Badge':
      'Gives the user permission to delete a badge on "Other Links" -> "Badge Management"',
    'Modify Badge Amount':
      'Gives the user permission to decrease the count of a badge on the Badge Reports Component',
    'Assign Badges':
      'Gives the user permission to assign badges to others users "User Profile" -> "Assign Badges"',
    'See Popup Management Tab (create and update popups)':
      'Make the "Other Links" -> "Popup Management" button appear and be able to create and update popups.',
    'See Project Management Tab (Full Functionality)':
      'Make the "Other Links" -> "Projects" button appear and be able to create or delete new projects, edit projects names, add members to projects, upload/import/create new WBSs, etc.',
    'Delete WBS':
      'Gives the user permission to delete any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Minus Red Icon"',
    'Add Task':
      'Gives the user permission to add a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Add task button"',
    'Delete Task':
      'Gives the user permission to delete a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Remove"',
    'Edit Task':
      'Gives the user permission to edit a task on any WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Choose any WBS" -> "Edit" -> "Edit"',
    'Suggest Changes on a task':
      'Gives the user permission to suggest changes on a task. "Dashboard" -> "Tasks tab" -> "Click on any task" -> "Suggest button"',
    'Add WBS':
      'Gives the user permission to create a new WBS. "Other Links" -> "Projects" -> "WBS Button" -> "Add new WBS Input"',
    'Add Project':
      'Gives the user permission to create any Project. "Other Links" -> "Projects" -> "Add new Project Input"',
    'Delete Project':
      'Gives the user permission to delete any Project. "Other Links" -> "Projects" -> "Delete button" ',
    'Edit Project':
      'Gives the user permission to edit the category or the status of any Project. "Other Links" -> "Projects"',
    'Find User in Project':
      'Gives the user permission to find any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input"',
    'Assign User in Project':
      'Gives the user permission to add any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Find user input"',
    'Unassign User in Project':
      'Gives the user permission to remove any user on the project members page. "Other Links" -> "Projects" -> "Members" -> "Minus button"',
      'See Teams Management Tab (Full Functionality)':
      'Make the "Other Links" -> "Teams" button appear and be able to add/delete teams, edit team names, and add/delete members.',
    'Edit/Delete Team': 'Gives the user permission to Edit or delete a team.',
    'Create Team': 'Gives the user permission to create a team.',
    'Assign Users Team':
    'Gives the user permission to add a user to a team from their profile page. "User Profile" -> "Teams" -> "Assign Team"',
    'Edit Timelog Information': 'Gives the user permission to edit any time log entry.',
    'Edit Project Category or Status':
    'Gives the user permission to edit the category or the status of any Project. "Other Links" -> "Projects"',
    'Add Time Entry (Others)':
      'Gives the user permission to add Intangible time entry to others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Add Time entry to (Name of the user) yellow button"',
    'Delete Time Entry (Others)':
      'Gives the user permission to Delete time entry from others users "Dashboard" -> "Leaderboard" -> "Dot By the side of user\'s name" -> "Current Time Log" -> "Trash button on bottom right"',
    'Toggle Tangible Time Self':
    'Gives the user permission to toggle the Tanglible check when editing their own time entry.',
    'Toggle Tangible/Intangible Time Others':
      'Gives the user permission to toggle the tanglible check when editing a time entry of another user.',
      'Edit Own Time Entry':
      'Gives the user permission to edit any time entry on their own time logs tab "Dashboard" -> "Current Time Log" -> "Pencil Icon"',
      'Delete Own Time Entry':
      'Gives the user permission to delete any time entry on their own time logs tab "Dashboard" -> "Current Time Log" -> "Trash Icon"',
    'Change User Status':
      'Gives the user permission to change the status of any user on the user profile page or User Management Page. "User Profile" -> "Green round button"',
    'Manage Admin Links in User Profile':
      'Gives the user permission to edit the links of any user on the user profile page. "User Profile" -> "Links button"',
    'Edit User Profile':
      'Gives the user permission to edit all the information of any user on the user profile page.',
    'See User Profiles in Projects':
      'Gives the user permission to access the profile of an user directly from the projects members page. "Other Links" -> "Projects" -> "Members" -> "Name of any member"',
    'Reset Password (Others)': 'Gives the user permission to Reset the password of any user.',
    'Timelog Data is Tangible':
      'Gives the user permission to toggle the tanglible check when editing a Time entry of another user.',
    'Toggle Summary Submit Form (Others)':
      'Gives the user permission to change the requirement to the user to submit a summary.',
    'Handle Blue Squares': 'Gives the user permission to Update/Delete/Edit any blue square.',
    'Only Assign Blue Squares': 'Gives the user permission to add blue squares to any user.',
    'See Permissions Management Tab and Edit Permission':
      'Gives the user permission to access the Permissions Management tab.',
    'Submit Weekly Summary For Others':
      'Gives the user permission to submit weekly summary for another user',
    'Change the Bio Announcement Status':
      'Gives the user permission to change the annoucement status',
      'Change Date on Intangible Time Entry':
      'Gives the user permission to edit the date when adding an intangible time entry.',
    'See Summary Indicator' : 
      'Give the ability to see on the dashboard the green ✓ indicator for when a summary has been submitted. ',
    'See Visibility Icon' : 
      'Give the ability to see on the dashboard the eye indicator for when a person is invisible. ',
    
  };
  const mainPermissions = []
  const darkMode = props.darkMode;
  const [permissions, setPermissions] = useState(props.permissions);
  const [deleteRoleModal, setDeleteRoleModal] = useState(false);
  const [editRoleNameModal, setEditRoleNameModal] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [changed, setChanged] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const history = useHistory();
  const [showPresetModal, setShowPresetModal] = useState(false);
  const userProfile = useSelector(state => state.userProfile);

  const isEditableRole =
    props.role === 'Owner'
      ? props.hasPermission('addDeleteEditOwners')
      : props.auth.user.role !== props.role;
  const canEditRole = isEditableRole && props.hasPermission('putRole');
  const canDeleteRole = isEditableRole && props.hasPermission('deleteRole');
  
  useEffect(() => {
    setRoleName(props.role);
    props.getPresets(props.role);
  }, []);

  useEffect(() => {
    setPermissions(props.permissions);
  }, [props.roles]);

  const toggleDeleteRoleModal = () => {
    setDeleteRoleModal(!deleteRoleModal);
  };

  const toggleEditRoleNameModal = () => {
    setEditRoleNameModal(!editRoleNameModal);
  };

  const handleChangeRoleName = e => {
    setRoleName(e.target.value);
  };

  useEffect(() => {
    roleName !== props.role ? setDisabled(false) : setDisabled(true);
  }, [roleName]);

  const handleSaveNewPreset = async () => {
    let count = 1;
    while (props.presets.some(preset => preset.presetName === 'New Preset ' + count)) {
      count += 1;
    }
    const newPreset = {
      presetName: 'New Preset ' + count,
      roleName: props.role,
      permissions: permissions,
    };

    const status = await props.createNewPreset(newPreset);
    if (status === 0) {
      toast.success(`Preset created successfully`);
    } else {
      toast.error(`Error creating preset`);
    }
  };

  const updateInfo = async () => {
    const permissionsObjectName = permissions.map(perm => {
      return getKeyByValue(permissionLabel, perm);
    });

    const permissionsBackEnd = permissionsObjectName.map(permission =>
      permissionFrontToBack(permission),
    );

    const id = props.roleId;

    const updatedRole = {
      roleName: roleName,
      permissions: permissions,
      roleId: id,
    };
    try {
      delete userProfile.permissions; // prevent overriding 'permissions' key-value pair
      await props.updateRole(id, { ...updatedRole, ...userProfile });
      history.push('/permissionsmanagement');
      toast.success('Role updated successfully');
      setChanged(false);
    } catch (error) {
      toast.error('Error updating role');
    }
  };

  const deleteRole = async () => {
    try {
      const URL = ENDPOINTS.ROLES_BY_ID(props.roleId);
      const res = await axios.delete(URL);
      history.push('/permissionsmanagement');
    } catch (error) {
      console.log(error.message);
    }
  };

  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  return (
    <>
      {changed ? (
        <Alert color="warning" className="user-role-tab__alert ">
          You have unsaved changes! Please click <strong>Save</strong> button to save changes!
        </Alert>
      ) : (
        <></>
      )}
      <header>
        <div className="user-role-tab__name-container">
          <div className="name-container__role-name">
            <h1 className="user-role-tab__h1">Role Name: {roleName}</h1>
            {canEditRole && (
              <FontAwesomeIcon
                icon={faEdit}
                size="lg"
                className={`user-role-tab__icon edit-icon ${darkMode ? 'text-light' : ''}`}
                onClick={toggleEditRoleNameModal}
              />
            )}
          </div>
          {canEditRole && (
            <div style={{ flexDirection: 'row', display: 'flex' }}>
              <div className="name-container__btn_columns">
                <div className="name-container__btns">
                  <Button
                    className="btn_save"
                    color="success"
                    onClick={handleSaveNewPreset}
                    style={boxStyling}
                  >
                    Create New Preset
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      setShowPresetModal(!showPresetModal);
                    }}
                    style={boxStyling}
                  >
                    Load Presets
                  </Button>
                </div>
                <div className="name-container__btns">
                  <Button
                    className="btn_save"
                    color="success"
                    onClick={() => updateInfo()}
                    style={boxStyling}
                  >
                    Save
                  </Button>
                  <Button
                    color="danger"
                    onClick={toggleDeleteRoleModal}
                    style={boxStyling}
                    disabled={!canDeleteRole}
                  >
                    Delete Role
                  </Button>
                </div>
              </div>

              <div
                className="icon-button-container"
                style={{ position: 'relative', width: '0', height: '0' }}
              >
                <div
                  className="name-container__btns"
                  style={{ position: 'absolute', left: '10px', top: '20px' }}
                >
                  <i
                    data-toggle="tooltip"
                    data-placement="center"
                    title="Click for information about this"
                    aria-hidden="true"
                    className="fa fa-info-circle"
                    onClick={() => {
                      handleModalOpen('Create New Preset');
                    }}
                  />
                  <i
                    data-toggle="tooltip"
                    data-placement="center"
                    title="Click for information about this"
                    aria-hidden="true"
                    className="fa fa-info-circle"
                    onClick={() => {
                      handleModalOpen('Load Presets');
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <Modal isOpen={editRoleNameModal} toggle={toggleEditRoleNameModal}>
            <ModalHeader>Edit Role Name</ModalHeader>
            <ModalBody>
              <label htmlFor="editRoleName">New Role Name</label>
              <Input
                type="text"
                name="editRoleName"
                id="editRoleName"
                value={roleName}
                onChange={handleChangeRoleName}
              />
            </ModalBody>
            <ModalFooter>
              <Button onClick={toggleEditRoleNameModal}>Cancel</Button>
              <Button
                color="success"
                disabled={disabled}
                onClick={() => {
                  toggleEditRoleNameModal();
                  setChanged(true);
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </Modal>
        </div>
        <h2 className="user-role-tab__h2">Permission List</h2>
      </header>
      <ul className="user-role-tab__permissionList">
        {props.permissionsList.map((permission) => (
          mainPermissions.includes(permission) ?
          <li className="user-role-tab__permissions" key={permission}>
            <p style={{ color: permissions.includes(permission) ? 'green' : 'red' , fontSize: '20px'}}>
              {permission}
            </p>
            <div className="icon-button-container">
              <i
                data-toggle="tooltip"
                data-placement="center"
                title="Click for more information"
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={() => {
                  handleModalOpen(permission);
                }}
              />
              &nbsp;&nbsp;
              <Button
                className="icon-button"
                color={permissions.includes(permission) ? 'danger' : 'success'}
                onClick={() => {
                  permissions.includes(permission)
                    ? onRemovePermission(permission)
                    : onAddPermission(permission);
                  setChanged(true);
                }}
                disabled={props?.userRole !== 'Owner'}
                style={boxStyle}
              >
                {permissions.includes(permission) ? 'Delete' : 'Add'}
              </Button>
            </div>
          </li>:
           <li className="user-role-tab__permissions" key={permission}>
            <p style={{ color: permissions.includes(permission) ? 'green' : 'red' , paddingLeft: '50px'}}>
              {permission}
            </p>
            <div className="icon-button-container">
              <i
                data-toggle="tooltip"
                data-placement="center"
                title="Click for more information"
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={() => {
                  handleModalOpen(permission);
                }}
              />
              &nbsp;&nbsp;
              <Button
                className="icon-button"
                color={permissions.includes(permission) ? 'danger' : 'success'}
                onClick={() => {
                  permissions.includes(permission)
                    ? onRemovePermission(permission)
                    : onAddPermission(permission);
                  setChanged(true);
                }}
                disabled={props?.userRole !== 'Owner'}
                style={boxStyle}
              >
                {permissions.includes(permission) ? 'Delete' : 'Add'}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Modal isOpen={deleteRoleModal} toggle={toggleDeleteRoleModal}>
        <ModalHeader>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            size="lg"
            className="user-role-tab__icon warning-icon"
          />
          Delete {roleName} Role
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete <strong>{roleName}</strong> role?
        </ModalBody>
        <ModalFooter>
          <Button onClick={toggleDeleteRoleModal} style={boxStyle}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => deleteRole()} style={boxStyle}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showPresetModal}
        toggle={() => {
          setShowPresetModal(previous => !previous);
        }}
        id="modal-content__new-role"
      >
        <ModalHeader
          toggle={() => {
            setShowPresetModal(previous => !previous);
          }}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto' }}
        >
          Role Presets
        </ModalHeader>
        <ModalBody id="modal-body_new-role--padding">
          <PermissionsPresetsModal
            roleId={props.roleId}
            roleName={props.role}
            onApply={perms => setPermissions(perms)}
          />
        </ModalBody>
      </Modal>
    </>
  );
}

const mapStateToProps = state => ({
  roles: state.role.roles,
  presets: state.rolePreset.presets,
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  updateRole: (roleId, updatedRole) => dispatch(updateRole(roleId, updatedRole)),
  getPresets: role => dispatch(getPresetsByRole(role)),
  createNewPreset: newPreset => dispatch(createNewPreset(newPreset)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RolePermissions);