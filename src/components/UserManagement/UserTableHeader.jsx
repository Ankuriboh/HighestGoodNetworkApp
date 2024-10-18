import React from 'react';
import userTableDataPermissions from '../../utils/userTableDataPermissions';
import {
  ACTIVE,
  FIRST_NAME,
  LAST_NAME,
  ROLE,
  EMAIL,
  WKLY_COMMITTED_HRS,
  PAUSE,
  USER_RESUME_DATE,
  MANAGE_FINAL_DAY,
  USER_START_DATE,
  USER_END_DATE,
  REQUESTED_TIME_OFF,
} from '../../languages/en/ui';

/**
 * The header row of the user table.
 */
const UserTableHeader = React.memo(({ authRole, roleSearchText, darkMode }) => {
  return (
    <tr className={darkMode ? 'bg-space-cadet' : ''}>
      <th scope="col" id="usermanagement_active">
        {ACTIVE}
      </th>
      <th scope="col" id="usermanagement_first">
        {FIRST_NAME}
      </th>
      <th scope="col" id="usermanagement_last_name">
        {LAST_NAME}
      </th>
      <th scope="col" id="usermanagement_role">
        {ROLE}
      </th>
      <th scope="col" id="usermanagement_email">
        {EMAIL}
      </th>
      <th scope="col" id="usermanagement_hrs">
        {WKLY_COMMITTED_HRS}
      </th>
      <th scope="col" id="usermanagement_pause">
        {PAUSE}
      </th>
      <th scope="col" id="usermanagement_requested_time_off">
        {REQUESTED_TIME_OFF}
      </th>
      <th scope="col" id="usermanagement_finalday">
        {MANAGE_FINAL_DAY}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_RESUME_DATE}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_START_DATE}
      </th>
      <th scope="col" id="usermanagement_resume_date">
        {USER_END_DATE}
      </th>
      {userTableDataPermissions(authRole, roleSearchText) && (
        <th scope="col" id="usermanagement_delete" aria-label="Delete User" />
      )}
    </tr>
  );
});

export default UserTableHeader;
