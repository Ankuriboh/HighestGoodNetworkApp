import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle, faCheck, faInfo } from '@fortawesome/free-solid-svg-icons';

import TaskButton from './TaskButton';
import CopyToClipboard from 'components/common/Clipboard/CopyToClipboard';
import { Table, Progress } from 'reactstrap';
import { Link } from 'react-router-dom';
import { getProgressColor, getProgressValue } from '../../utils/effortColors';
import './style.css';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';

const TeamMemberTask = ({
  user,
  userIndex,
  handleMarkAsDoneModal,
  handleOpenTaskNotificationModal,
  handleFollowUp,
  userRole,
}) => {
  let totalHoursLogged = 0;
  let totalHoursRemaining = 0;
  const thisWeekHours = user.totaltangibletime_hrs;
  const rolesAllowedToResolveTasks = ['Administrator', 'Owner'];
  const isAllowedToResolveTasks = rolesAllowedToResolveTasks.includes(userRole);
  const isAllowedToFollowUpWithPeople = userRole !== 'Volunteer';
  const isFollowUpWith = [];
  if (user.tasks) {
    user.tasks = user.tasks.map(task => {
      task.hoursLogged = task.hoursLogged ? task.hoursLogged : 0;
      task.estimatedHours = task.estimatedHours ? task.estimatedHours : 0;
      return task;
    });
    totalHoursLogged = user.tasks
      .map(task => task.hoursLogged)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0);
    for (const task of user.tasks) {
      if (task.status !== 'Complete' && task.isAssigned !== 'false') {
        totalHoursRemaining = totalHoursRemaining + (task.estimatedHours - task.hoursLogged);
      }
    }
  }

  if (user.tasks) {
    user.tasks.forEach(task => {
      const followedUpResources = task.resources?.filter(
        resource => resource.userID === user.personId && resource.followedUp,
      );

      if (followedUpResources?.length > 0) {
        isFollowUpWith.push(task._id);
      }
    });
  }

  const handleCheckboxFollowUp = (taskId, userId, userIndex, taskIndex) => {
    handleFollowUp(taskId, userId, !isFollowUpWith.includes(taskId), userIndex, taskIndex);
    // if (isFollowUpWith.includes(taskId)) {
    //   // If the value is already in the checkedItems array, remove it
    //   setIsFollowUpWith(isFollowUpWith.filter(item => item !== taskId));
    // } else {
    //   // If the value is not in the checkedItems array, add it
    //   setIsFollowUpWith([...isFollowUpWith, taskId]);
    // }
  };

  return (
    <>
      <tr className="table-row" key={user.personId}>
        {/* green if member has met committed hours for the week, red if not */}
        <td>
          <div className="committed-hours-circle">
            <FontAwesomeIcon
              style={{
                color: user.totaltangibletime_hrs >= user.weeklycommittedHours ? 'green' : 'red',
              }}
              icon={faCircle}
            />
          </div>
        </td>
        <td>
          <Table borderless className="team-member-tasks-subtable">
            <tbody>
              <tr>
                <td className="team-member-tasks-user-name">
                  <Link to={`/userprofile/${user.personId}`}>{`${user.name}`}</Link>
                </td>
                <td data-label="Time" className="team-clocks">
                  <u>{user.weeklycommittedHours ? user.weeklycommittedHours : 0}</u> /
                  <font color="green"> {thisWeekHours ? thisWeekHours.toFixed(1) : 0}</font> /
                  <font color="red">
                    {' '}
                    {totalHoursRemaining ? totalHoursRemaining.toFixed(1) : 0}
                  </font>
                </td>
              </tr>
            </tbody>
          </Table>
        </td>
        <td>
          <Table borderless className="team-member-tasks-subtable">
            <tbody>
              {user.tasks &&
                user.tasks.map((task, taskIndex) => {
                  let isActiveTaskForUser = true;
                  if (task?.resources) {
                    isActiveTaskForUser = !task.resources?.find(
                      resource => resource.userID === user.personId,
                    ).completedTask;
                  }
                  if (task.wbsId && task.projectId && isActiveTaskForUser) {
                    return (
                      <tr key={`${task._id}${taskIndex}`} className="task-break">
                        <td data-label="Task(s)" className="task-align">
                          <p>
                            <Link to={task.projectId ? `/wbs/tasks/${task._id}` : '/'}>
                              <span>{`${task.num} ${task.taskName}`} </span>
                            </Link>
                            <CopyToClipboard writeText={task.taskName} message="Task Copied!" />
                            {task.taskNotifications.length > 0 && (
                              <FontAwesomeIcon
                                className="team-member-tasks-bell"
                                icon={faBell}
                                onClick={() => {
                                  handleOpenTaskNotificationModal(
                                    user.personId,
                                    task,
                                    task.taskNotifications,
                                  );
                                }}
                              />
                            )}
                            {isAllowedToResolveTasks && (
                              <FontAwesomeIcon
                                className="team-member-tasks-done"
                                icon={faCheck}
                                title="Mark as Done"
                                onClick={() => {
                                  handleMarkAsDoneModal(user.personId, task);
                                }}
                              />
                            )}
                          </p>
                        </td>
                        {task.hoursLogged != null && task.estimatedHours != null && (
                          <td data-label="Progress" className="team-task-progress">
                            <div className="team-task-progress-container">
                              <span
                                className={`team-task-progress-time ${
                                  isAllowedToFollowUpWithPeople
                                    ? ''
                                    : 'team-task-progress-time-volunteers'
                                }`}
                              >
                                {`${parseFloat(task.hoursLogged.toFixed(2))}
                            of 
                          ${parseFloat(task.estimatedHours.toFixed(2))}`}
                              </span>
                              <Progress
                                color={getProgressColor(
                                  task.hoursLogged,
                                  task.estimatedHours,
                                  true,
                                )}
                                value={getProgressValue(task.hoursLogged, task.estimatedHours)}
                                className="team-task-progress-bar"
                              />
                              {isAllowedToFollowUpWithPeople && (
                                <>
                                  <input
                                    type="checkbox"
                                    title="This box is used to track follow ups. Clicking it means you’ve checked in with a person that they are on track to meet their deadline"
                                    className="team-task-progress-follow-up team-task-progress-follow-up-red"
                                    data-id={task._id}
                                    checked={isFollowUpWith.includes(task._id)}
                                    onChange={() =>
                                      handleCheckboxFollowUp(
                                        task._id,
                                        user.personId,
                                        userIndex,
                                        taskIndex,
                                      )
                                    }
                                  />
                                  {isFollowUpWith.includes(task._id) && (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      title="This box is used to track follow ups. Clicking it means you’ve checked in with a person that they are on track to meet their deadline"
                                      className="team-task-progress-follow-up-check"
                                      data-id={task._id}
                                      onClick={() =>
                                        handleCheckboxFollowUp(
                                          task._id,
                                          user.personId,
                                          userIndex,
                                          taskIndex,
                                        )
                                      }
                                    />
                                  )}
                                  <FontAwesomeIcon
                                    icon={faInfo}
                                    className="follow-up-button-info-icon"
                                    data-tip="true"
                                    data-for="follow-up-button-tip"
                                    data-delay-hide="500"
                                    aria-hidden="true"
                                  />
                                  <ReactTooltip
                                    id="follow-up-button-tip"
                                    place="bottom"
                                    effect="solid"
                                  >
                                    This checkbox allows you to track follow-ups. By clicking it,
                                    you indicate that you have checked <br /> in with a person to
                                    ensure they are on track to meet their deadline.
                                    <br />
                                    <br />
                                    The checkbox is visible and accessible to all classes except
                                    volunteers. Checking the box will modify
                                    <br /> its appearance for all others who can see it.
                                    <br />
                                    <br />
                                    When a person's task is at 50%, 75%, or 90% of the deadline, the
                                    checkbox changes to a red outline with a <br />
                                    light pink filler. This visual cue indicates that the person
                                    requires follow-up. <br />
                                    Once checked, the box reverts to a green outline with a light
                                    green filler and a check mark inside.
                                    <br />
                                    <br />
                                    The checkbox automatically clears when a person reaches 75% and
                                    90% of their task deadline, <br />
                                    serving as a reminder for follow-up actions.
                                    <br />
                                    <br />
                                  </ReactTooltip>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                        {userRole === 'Administrator' ? (
                          <td data-label="Status">
                            <TaskButton task={task} key={task._id}></TaskButton>
                          </td>
                        ) : null}
                      </tr>
                    );
                  }
                })}
            </tbody>
          </Table>
        </td>
      </tr>
    </>
  );
};

export default TeamMemberTask;
