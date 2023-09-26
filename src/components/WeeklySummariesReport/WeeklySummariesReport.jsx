/* eslint-disable no-shadow */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Alert,
  Container,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';
import { MultiSelect } from 'react-multi-select-component';
import './WeeklySummariesReport.css';
import moment from 'moment';
import 'moment-timezone';
import { boxStyle } from 'styles';
import SkeletonLoading from '../common/SkeletonLoading';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';
import hasPermission from '../../utils/permissions';
import { getInfoCollections } from '../../actions/information';
import { fetchAllBadges } from '../../actions/badgeManagement';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];

export class WeeklySummariesReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      loading: true,
      summaries: [],
      activeTab: navItems[1],
      badges: [],
      loadBadges: false,
      hasSeeBadgePermission: false,
      selectedCodes: [],
      selectedColors: [],
      filteredSummaries: [],
    };

    this.weekDates = Array(4)
      .fill(null)
      .map((_, index) => this.getWeekDates(index));
  }

  async componentDidMount() {
    const {
      error,
      loading,
      allBadgeData,
      authUser,
      infoCollections,
      getWeeklySummariesReport,
      fetchAllBadges,
      getInfoCollections,
      hasPermission,
    } = this.props;

    // 1. fetch report
    const res = await getWeeklySummariesReport();
    const summaries = res?.data ?? this.props.summaries
    const badgeStatusCode = await fetchAllBadges();

    this.canPutUserProfileImportantInfo = hasPermission('putUserProfileImportantInfo');
    this.bioEditPermission = this.canPutUserProfileImportantInfo;
    this.canEditSummaryCount = this.canPutUserProfileImportantInfo;
    this.codeEditPermission = this.canPutUserProfileImportantInfo;

    // 2. shallow copy and sort
    let summariesCopy = [...summaries];
    summariesCopy = this.alphabetize(summariesCopy);

    // 3. add new key of promised hours by week
    summariesCopy = summariesCopy.map(summary => {
      // append the promised hours starting from the latest week (this week)
      const promisedHoursByWeek = this.weekDates.map(weekDate =>
        this.getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
      );
      return { ...summary, promisedHoursByWeek };
    });

    const teamCodeSet = [...new Set(summariesCopy.filter(
      function(summary) {
      if(summary.teamCode == ''){
        return false;
      }
      return true;
    }).map(s => s.teamCode))];
    this.teamCodes = [];

    const colorOptionSet = [...new Set(summariesCopy.filter(
      function(summary) {
      if(summary.weeklySummaryOption == undefined){
        return false;
      }
      return true;
    }).map(s => s.weeklySummaryOption))];
    this.colorOptions = [];

    if(teamCodeSet.length != 0) {
      teamCodeSet.forEach((code, index) => {
        this.teamCodes[index] = {value: code, label: code};
      });
      colorOptionSet.forEach((option, index) => {
        this.colorOptions[index] = {value: option, label: option};
      });
    }

    this.setState({
      error,
      loading,
      allRoleInfo: [],
      summaries: summariesCopy,
      activeTab:
        sessionStorage.getItem('tabSelection') === null
          ? navItems[1]
          : sessionStorage.getItem('tabSelection'),
      badges: allBadgeData,
      hasSeeBadgePermission: badgeStatusCode === 200,
      filteredSummaries: summariesCopy,
    });
    await getInfoCollections();
    const role = authUser?.role;
    const roleInfoNames = this.getAllRoles(summariesCopy);
    const allRoleInfo = [];
    if (Array.isArray(infoCollections)) {
      infoCollections.forEach(info => {
        if (roleInfoNames?.includes(info.infoName)) {
          const visible =
            info.visibility === '0' ||
            (info.visibility === '1' && (role === 'Owner' || role === 'Administrator')) ||
            (info.visibility === '2' && role !== 'Volunteer');
          // eslint-disable-next-line no-param-reassign
          info.CanRead = visible;
          allRoleInfo.push(info);
        }
      });
    }
    this.setState({ allRoleInfo });
  }

  // componentDidUpdate(preProps) {
  //   const {summaries} = preProps

  //   if (this.props.summaries !== summaries) {
  //     let summariesCopy = [...summaries];
  //     summariesCopy = this.alphabetize(summariesCopy);

  //     // 3. add new key of promised hours by week
  //     summariesCopy = summariesCopy.map(summary => {
  //       // append the promised hours starting from the latest week (this week)
  //       const promisedHoursByWeek = this.weekDates.map(weekDate =>
  //         this.getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
  //       );
  //       return { ...summary, promisedHoursByWeek };
  //     });

  //     this.setState({filteredSummaries: summariesCopy, summaries: summariesCopy})
  //   }
  // }

  componentWillUnmount() {
    sessionStorage.removeItem('tabSelection');
  }

  /**
   * Sort the summaries in alphabetixal order
   * @param {*} summaries
   * @returns
   */
  alphabetize = summaries => {
    const temp = [...summaries];
    return temp.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastname}`),
    );
  };

  /**
   * Get the roleNames
   * @param {*} summaries
   * @returns
   */
  getAllRoles = summaries => {
    const roleNames = summaries.map(summary => `${summary.role}Info`);
    const uniqueRoleNames = [...new Set(roleNames)];
    return uniqueRoleNames;
  };

  getWeekDates = weekIndex => ({
    fromDate: moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week')
      .format('MMM-DD-YY'),
    toDate: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week')
      .format('MMM-DD-YY'),
  });

  /**
   * This function calculates the hours promised by a user by a given end date of the week.
   * It goes through the user's committed hours history and returns the last committed hour value that is less than or equal to the given date.
   * If there's no such record in the history, it returns 10 (default value).
   * If the history does not exist at all, it returns -1.
   *
   * @param {string} weekToDateX - The end date of the week in question. It should be a string that can be parsed into a Date object.
   * @param {Array<Object>} weeklycommittedHoursHistory - An array of user's committed hours history records. Each record should be an object that contains at least the properties 'dateChanged' (a string that can be parsed into a Date object) and 'hours' (a number).
   *
   * @returns {number} The hours promised by the user by the given end date.
   */
  getPromisedHours = (weekToDateX, weeklycommittedHoursHistory) => {
    // 0. Edge case: If the history doesnt even exist
    // only happens if the user is created without the backend changes
    if (!weeklycommittedHoursHistory) {
      return -1;
    }
    // 1. Edge case: If there is none, return 10 (the default value of weeklyComHours)
    if (weeklycommittedHoursHistory.length === 0) {
      return 10;
    }

    const weekToDateReformat = new Date(weekToDateX).setHours(23, 59, 59, 999);
    // 2. Iterate weeklycommittedHoursHistory from the last index (-1) to the beginning
    for (let i = weeklycommittedHoursHistory.length - 1; i >= 0; i -= 1) {
      const historyDateX = new Date(weeklycommittedHoursHistory[i].dateChanged);
      // console.log(`${weekToDateX} >= ${historyDateX} is ${weekToDateX >= historyDateX}`);
      // As soon as the weekToDate is greater or equal than current history date
      if (weekToDateReformat >= historyDateX) {
        // return the promised hour
        return weeklycommittedHoursHistory[i].hours;
      }
    }

    // 3. at this date when the week ends, the person has not even join the team
    // so it promised 0 hours
    return 0;
  };

  toggleTab = tab => {
    const { activeTab } = this.state;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
      sessionStorage.setItem('tabSelection', tab);
    }
  };

  filterWeeklySummaries = () => {
    const selectedCodesArray = this.state.selectedCodes.map(e => e.value);
    const selectedColorsArray = this.state.selectedColors.map(e => e.value);
    const temp = this.state.summaries.filter(summary => (selectedCodesArray.length == 0 || selectedCodesArray.includes(summary.teamCode)) && (selectedColorsArray.length == 0 || selectedColorsArray.includes(summary.weeklySummaryOption)));
    this.setState({filteredSummaries: temp});
  };

  handleSelectCodeChange = event => {
    this.setState({selectedCodes: event}, () => this.filterWeeklySummaries());
  };

  handleSelectColorChange = event => {
    this.setState({selectedColors: event}, () => this.filterWeeklySummaries());
  };

  render() {
    const {
      error,
      loading,
      summaries,
      activeTab,
      allRoleInfo,
      badges,
      loadBadges,
      hasSeeBadgePermission,
      selectedCodes,
      selectedColors,
      filteredSummaries,
    } = this.state;

    if (error) {
      return (
        <Container>
          <Row className="align-self-center" data-testid="error">
            <Col>
              <Alert color="danger">Error! {error.message}</Alert>
            </Col>
          </Row>
        </Container>
      );
    }

    if (loading) {
      return (
        <Container fluid style={{ backgroundColor: '#f3f4f6' }}>
          <Row className="text-center" data-testid="loading">
            <SkeletonLoading template="WeeklySummariesReport" />
          </Row>
        </Container>
      );
    }

    return (
      <Container fluid className="bg--white-smoke py-3 mb-5">
        <Row>
          <Col lg={{ size: 10, offset: 1 }}>
            <h3 className="mt-3 mb-5">Weekly Summaries Reports page</h3>
          </Col>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Col lg={{ size: 5, offset:1 }} xs={{size: 5, offset: 1}}>
            Select Team Code
            <MultiSelect
              options={this.teamCodes}
              value={selectedCodes}
              onChange={(e) => {this.handleSelectCodeChange(e)}}/>
          </Col>
          <Col lg={{ size: 5 }} xs={{size: 5}}>
            Select Color
            <MultiSelect
              options={this.colorOptions}
              value={selectedColors}
              onChange={(e) => {this.handleSelectColorChange(e)}}/>
          </Col>
        </Row>
        <Row>
          <Col lg={{ size: 10, offset: 1 }}>
            <Nav tabs>
              {navItems.map(item => (
                <NavItem key={item}>
                  <NavLink
                    href="#"
                    data-testid={item}
                    active={item === activeTab}
                    onClick={() => this.toggleTab(item)}
                  >
                    {item}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={activeTab} className="p-4">
              {navItems.map((item, index) => (
                <WeeklySummariesReportTab tabId={item} key={item} hidden={item !== activeTab}>
                  <Row>
                    <Col sm="12" md="6" className="mb-2">
                      From <b>{this.weekDates[index].fromDate}</b> to{' '}
                      <b>{this.weekDates[index].toDate}</b>
                    </Col>
                    <Col sm="12" md="6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <GeneratePdfReport
                        summaries={filteredSummaries}
                        weekIndex={index}
                        weekDates={this.weekDates[index]}
                      />
                      {hasSeeBadgePermission && (
                        <Button
                          className="btn--dark-sea-green"
                          style={boxStyle}
                          onClick={() => this.setState({ loadBadges: !loadBadges })}
                        >
                          {loadBadges ? 'Hide Badges' : 'Load Badges'}
                        </Button>
                      )}
                      <Button className="btn--dark-sea-green" style={boxStyle}>
                        Load Trophies
                      </Button>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <b>Total Team Members:</b> {filteredSummaries.length}
                    </Col>
                </Row>
                  <Row>
                    <Col>
                      <FormattedReport
                        summaries={filteredSummaries}
                        weekIndex={index}
                        bioCanEdit={this.bioEditPermission}
                        canEditSummaryCount={this.canEditSummaryCount}
                        allRoleInfo={allRoleInfo}
                        badges={badges}
                        loadBadges={loadBadges}
                        canEditTeamCode={this.codeEditPermission}
                      />
                    </Col>
                  </Row>
                </WeeklySummariesReportTab>
              ))}
            </TabContent>
          </Col>
        </Row>
      </Container>
    );
  }
}

WeeklySummariesReport.propTypes = {
  error: PropTypes.any,
  loading: PropTypes.bool.isRequired,
  summaries: PropTypes.array.isRequired,
  infoCollections: PropTypes.array,
};

const mapStateToProps = state => ({
  error: state.weeklySummariesReport.error,
  loading: state.weeklySummariesReport.loading,
  summaries: state.weeklySummariesReport.summaries,
  allBadgeData: state.badge.allBadgeData,
  infoCollections: state.infoCollections.infos,
});

const mapDispatchToProps = dispatch => ({
  fetchAllBadges: () => dispatch(fetchAllBadges()),
  getWeeklySummariesReport: () => dispatch(getWeeklySummariesReport()),
  hasPermission: () => hasPermission(),
  getInfoCollections: () => getInfoCollections(),
});

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummariesReport);
