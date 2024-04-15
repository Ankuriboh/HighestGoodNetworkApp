import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'reactstrap';
import { useDispatch, connect } from 'react-redux';
import ReactHtmlParser from 'react-html-parser';
import moment from 'moment-timezone';
import './Timelog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import TimeEntryForm from './TimeEntryForm';
import DeleteModal from './DeleteModal';

import { editTimeEntry, getTimeEntriesForWeek } from '../../actions/timeEntries';
import { getUserProfile, updateUserProfile } from '../../actions/userProfile';
import { editTeamMemberTimeEntry } from '../../actions/task';
import hasPermission from 'utils/permissions';
import { hrsFilterBtnColorMap } from 'constants/colors';


import checkNegativeNumber from 'utils/checkNegativeHours';

/**
 * This component can be imported in TimeLog component's week tabs and Tasks tab
 *  1. In TimeLog - current week time log, last week, week before ... tabs:
 *    time entry data are from state.timeEntries;
 *    time entry user profile is from state.userProfile
 * 
 *  2. In TimeLog - Tasks tab:
 *    time entry data and user profile are both from state.teamMemberTasks.usersWithTimeEntries
 * 
 *  check string value of from to decide which state to change upon time entry edit
 */

const TimeEntry = (props) => {
  // props from parent
  const { from, data, displayYear, timeEntryUserProfile, displayUserProjects, displayUserTasks, tab } = props
  // props from store
  const { authUser } = props;

  const { _id: timeEntryUserId } = timeEntryUserProfile;
  const { _id: timeEntryId } = data;

  const [timeEntryFormModal, setTimeEntryFormModal] = useState(false);
  const dispatch = useDispatch();

  const { 
    dateOfWork, 
    isTangible, 
    hours,
    minutes,
    projectId,
    taskId,
    notes,
  } = data;

  let projectName, projectCategory, taskName, taskClassification;

   // Prevent update time entry if user has been removed from the project ONLY IN WeeklyTab.
   // Default to false. Will re-assign shouldPreventTimeEntryUpdateInWeeklyTab value if current tab is WeeklyTab
  let shouldPreventTimeEntryUpdateInWeeklyTab = false;

  if (from === 'TaskTab') {
    // Time Entry rendered under Tasks tab
    ({ projectName, projectCategory, taskName, taskClassification } = data)
  } else {
    // Time Entry rendered under weekly tabs    
    // check if user has been removed from the project. Will prevent update time entry if true
    shouldPreventTimeEntryUpdateInWeeklyTab = !displayUserProjects.find(project => project.projectId === projectId);

    // Temporary fix for time entry of task/project not associated with current user 
    ({ projectName, projectCategory } = data);
    ({ taskName, taskClassification }  = data);

    // SET projectName, projectCategory, taskName, and taskClassification to '' if not exist
    if (!projectCategory) projectCategory = '';
    if (!projectName) projectName = '';
    if (!taskName) taskName = '';
    if (!taskClassification) taskClassification = '';

  }
  
  const toggle = () => setTimeEntryFormModal(modal => !modal);

  const isAuthUser = timeEntryUserId === authUser.userid;
  const isSameDay = moment().tz('America/Los_Angeles').format('YYYY-MM-DD') === dateOfWork;
      
  //default permission: auth use can edit own sameday timelog entry, but not tangibility
  const isAuthUserAndSameDayEntry = isAuthUser && isSameDay;

  //permission to edit any time log entry (from other user's Dashboard
    // For Administrator/Owner role, hasPermission('editTimelogInfo') should be true by default
  const canEdit = dispatch(hasPermission('editTimelogInfo')) 
    //permission to edit any time entry on their own time logs tab
    || dispatch(hasPermission('editTimeEntry')) 

  //permission to Delete time entry from other user's Dashboard
  const canDelete = dispatch(hasPermission('deleteTimeEntryOthers')) ||
    //permission to delete any time entry on their own time logs tab
    dispatch(hasPermission('deleteTimeEntry')) ||
    //default permission: delete own sameday tangible entry
    isAuthUserAndSameDayEntry;

 
  const toggleTangibility = () => {
    //Update intangible hours property in userprofile
    const formattedHours = parseFloat(hours) + parseFloat(minutes) / 60;
    const { hoursByCategory } = timeEntryUserProfile;
    if (projectName) {
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === projectCategory);
      //change tangible to intangible
      if (isTangible) {
        timeEntryUserProfile.totalIntangibleHrs += formattedHours;
        isFindCategory
          ? (hoursByCategory[projectCategory] -= formattedHours)
          : (hoursByCategory['unassigned'] -= formattedHours);
      } else {
        //change intangible to tangible
        timeEntryUserProfile.totalIntangibleHrs -= formattedHours;
        isFindCategory
          ? (hoursByCategory[projectCategory] += formattedHours)
          : (hoursByCategory['unassigned'] += formattedHours);
      }
    } else {
      const isFindCategory = Object.keys(hoursByCategory).find(key => key === taskClassification);
      //change tangible to intangible
      if (isTangible) {
        timeEntryUserProfile.totalIntangibleHrs += formattedHours;
        isFindCategory
          ? (hoursByCategory[taskClassification] -= formattedHours)
          : (hoursByCategory['unassigned'] -= formattedHours);
      } else {
        //change intangible to tangible
        timeEntryUserProfile.totalIntangibleHrs -= formattedHours;
        isFindCategory
          ? (hoursByCategory[taskClassification] += formattedHours)
          : (hoursByCategory['unassigned'] += formattedHours);
      }
    }
    checkNegativeNumber(timeEntryUserProfile);

    const newData = {
      ...data,
      isTangible: !isTangible,
    };

    if (from === 'TaskTab') {
      dispatch(editTeamMemberTimeEntry(newData));
    } else if (from === 'WeeklyTab') {
      dispatch(editTimeEntry(timeEntryId, newData));
      dispatch(updateUserProfile(timeEntryUserProfile));
      dispatch(getTimeEntriesForWeek(timeEntryUserId, tab));
    }
  };
  let filteredColor;
  const daysPast = moment().diff(dateOfWork, 'days');
  switch (true) {
    case daysPast === 0:
      filteredColor = hrsFilterBtnColorMap[1];
      break;
    case daysPast === 1:
      filteredColor = hrsFilterBtnColorMap[2];
      break;
    case daysPast === 2:
      filteredColor = hrsFilterBtnColorMap[3];
      break;
    case daysPast === 3:
      filteredColor = hrsFilterBtnColorMap[4];
      break;
    default:
      filteredColor = hrsFilterBtnColorMap[7];
  }

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          width: '12px',
          marginBottom: '4px',
          border: `5px solid ${filteredColor}` ,
          backgroundColor: taskId ? filteredColor : 'white',
        }}
      ></div>
      <Card className="mb-1 p-2" style={{ backgroundColor: isTangible ? '#CCFFCC' : '#CCFFFF', flexGrow: 1, maxWidth: "calc(100% - 12px)" }}>
        <Row className="mx-0">
          <Col md={3} className="date-block px-0">
            <div className="date-div">
              <div>
                <h4>{moment(dateOfWork).format('MMM D')}</h4>
                {displayYear && <h5>{moment(dateOfWork).format('YYYY')}</h5>}
                <h5 className="text-info">{moment(dateOfWork).format('dddd')}</h5>
              </div>
            </div>
          </Col>
          <Col md={4} className="px-0">
            <h4 className="text-success">
              {hours}h {minutes}m
            </h4>
            <div className="text-muted">Project/Task:</div>
            <p> 
              {projectName} 
              <br />
              {taskName && `\u2003 ↳ ${taskName}`} 
            </p>
            <div className='mb-3'>
            {
              (canEdit && (from === 'WeeklyTab' ? !shouldPreventTimeEntryUpdateInWeeklyTab : true))
                ? ( 
                    <>
                      <span className="text-muted">Tangible:&nbsp;</span>
                      <input
                          type="checkbox"
                          name="isTangible"
                          checked={isTangible}
                          disabled={!canEdit}
                          onChange={toggleTangibility}
                      />
                    </>
                  )
                : <span className="font-italic">{isTangible ? 'Tangible' : 'Intangible'}</span> 
            }
            </div>
          </Col>
          <Col md={5} className="pl-2 pr-0">
            <div className="text-muted">Notes:</div>
            {ReactHtmlParser(notes)}
            <div className="buttons">
              {((canEdit || isAuthUserAndSameDayEntry) && (from === 'WeeklyTab' ? !shouldPreventTimeEntryUpdateInWeeklyTab : true)) 
                && from === 'WeeklyTab' 
                && (
                  <button className="mr-3 text-primary">
                    <FontAwesomeIcon icon={faEdit} size="lg" onClick={toggle} />
                  </button>
              )}
              {canDelete && (from === 'WeeklyTab' ? !shouldPreventTimeEntryUpdateInWeeklyTab : true) && (
                <button className='text-primary'>
                  <DeleteModal
                    timeEntry={data}
                    userProfile={timeEntryUserProfile}
                    projectCategory={projectCategory}
                    taskClassification={taskClassification}
                  />
                </button>
              )}
            </div>
            {(from === 'WeeklyTab' ? shouldPreventTimeEntryUpdateInWeeklyTab : false) && (
              <div className="text-danger">
                <small>Warning: The user has been removed from the project. You should not update the time entry.</small>
              </div>
            )}
          </Col>
        </Row>
      </Card>
      {/* this TimeEntryForm could be rendered from either weekly tab or task tab */}
      <TimeEntryForm
        from={from}
        edit={true}
        data={data}
        toggle={toggle}
        isOpen={timeEntryFormModal}
        tab={tab}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  authUser: state.auth.user,
})

export default connect(mapStateToProps, null)(TimeEntry);
