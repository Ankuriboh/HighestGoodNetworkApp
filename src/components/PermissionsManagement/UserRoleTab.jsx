import { useEffect } from 'react';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';

export const permissionLabel = {
  seeWeeklySummaryReports: 'See Only Weekly Summary Reports Tab',
  seeUserManagement: 'See User Management Tab (Full Functionality)',
  seeBadgeManagement: 'See Badge Management Tab (Full Functionality)',
  deleteOwnBadge: 'Delete Badge',
  modifyOwnBadgeAmount: 'Modify Badge Amount',
  assignBadgeOthers: 'Assign Badges',
  seeProjectManagement: 'See Project Management Tab (Full Functionality)',
  addProject: 'Add Project',
  deleteProject: 'Delete Project',
  editProject: 'Edit Project Category or Status',
  seeUserProfileInProjects: 'See User Profiles in Projects',
  findUserInProject: 'Find User in Project',
  assignUserInProject: 'Assign User in Project',
  unassignUserInProject: 'Unassign User in Project',
  addWbs: 'Add WBS',
  deleteWbs: 'Delete WBS',
  addTask: 'Add Task',
  editTask: 'Edit Task',
  deleteTask: 'Delete Task',
  suggestTask: 'Suggest Changes on a task',
  seeTeamsManagement: 'See Teams Management Tab (Full Functionality)',
  createTeam: 'Create Team',
  editDeleteTeam: 'Edit/Delete Team',
  editTimelogInfo: 'Edit Timelog Information',
  addTimeEntryOthers: 'Add Time Entry (Others)',
  deleteTimeEntryOthers: 'Delete Time Entry (Others)',
  toggleTangibleTime: 'Toggle Tangible Time Self',
  toggleTangibleTimeOthers: 'Toggle Tangible/Intangible Time Others',
  changeIntangibleTimeEntryDate: 'Change Date on Intangible Time Entry',
  editTimeEntry: 'Edit Own Time Entry',
  deleteTimeEntry: 'Delete Own Time Entry',
  editUserProfile: 'Edit User Profile',
  changeUserStatus: 'Change User Status',
  handleBlueSquare: 'Handle Blue Squares',
  assignOnlyBlueSquares: 'Only Assign Blue Squares',
  adminLinks: 'Manage Admin Links in User Profile',
  assignTeamToUser: 'Assign Users Team',
  resetPasswordOthers: 'Reset Password (Others)',
  toggleSubmitForm: 'Toggle Summary Submit Form (Others)',
  submitWeeklySummaryForOthers: 'Submit Weekly Summary For Others',
  seePermissionsManagement: 'See Permissions Management Tab and Edit Permission',
  seePopupManagement: 'See Popup Management Tab (create and update popups)',
  seeSummaryIndicator: 'See Summary Indicator',
  seeVisibilityIcon: 'See Visibility Icon',
};
import { boxStyle, boxStyleDark } from 'styles';
import RolePermissions from './RolePermissions';

function UserRoleTab(props) {
  const { darkMode } = props;

  useEffect(() => {
    props.getUserRole(props.auth?.user.userid);
  }, []);
  const history = useHistory();

  const roleNames = props.roles.map(role => role.roleName);
  const userRoleParamsURL = props.match.params.userRole;
  const roleIndex = roleNames.findIndex(
    roleName => roleName.toLowerCase() === userRoleParamsURL.replace('-', ' '),
  );

  if (roleIndex === -1) {
    return (
      <div className="userRoleTab__container">
        <h1>Error</h1>
        <div>User Role not existent</div>
        <a href="/permissionsmanagement">Back to permissions management</a>
      </div>
    );
  }

  const actualRole = props.roles[roleIndex];
  const { permissions } = actualRole;
  const { roleName } = actualRole;
  const roleId = actualRole._id;

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
      <div className="userRoleTab__container">
        <button
          type="button"
          onClick={() => history.push('/permissionsmanagement')}
          className="userRoleTab__backBtn"
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Back
        </button>
        <RolePermissions
          userRole={props.userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={permissions}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  // eslint-disable-next-line no-undef
  getAllRoles: () => dispatch(getAllRoles()),
  getUserRole: id => dispatch(getUserProfile(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRoleTab);
