import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput,
  Button,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  UncontrolledDropdown,
  DropdownMenu, 
  DropdownItem,
  DropdownToggle
} from 'reactstrap';
import './WeeklySummary.css';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { Editor } from 'primereact/editor';
import { getWeeklySummaries, updateWeeklySummaries } from '../../actions/weeklySummaries';
import DueDateTime from './DueDateTime';
import moment from 'moment';
import 'moment-timezone';
import Loading from '../common/Loading';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { WeeklySummaryContentTooltip, MediaURLTooltip } from './WeeklySummaryTooltips';
import classnames from 'classnames';
import { getUserProfile } from 'actions/userProfile';
import CurrentPromptModal from './CurrentPromptModal.jsx';

// Need this export here in order for automated testing to work.
export class WeeklySummary extends Component {
  state = {
    summariesCountShowing: 0,
    originSummaries: {
      summary: '',
      summaryLastWeek: '',
      summaryBeforeLast: '',
      summaryThreeWeeksAgo: '',
    },
    formElements: {
      summary: '',
      summaryLastWeek: '',
      summaryBeforeLast: '',
      summaryThreeWeeksAgo: '',
      mediaUrl: '',
      weeklySummariesCount: 0,
      mediaConfirm: false,
    },
    dueDate: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .toISOString(),
    dueDateLastWeek: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(1, 'week')
      .toISOString(),
    dueDateBeforeLast: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(2, 'week')
      .toISOString(),
    dueDateThreeWeeksAgo: moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(3, 'week')
      .toISOString(),
    uploadDate: this.dueDate,
    uploadDateLastWeek: this.dueDateLastWeek,
    uploadDateBeforeLast: this.dueDateBeforeLast,
    uploadDateThreeWeeksAgo: this.dueDateThreeWeeksAgo,
    submittedCountInFourWeeks: 0,
    activeTab: '1',
    errors: {},
    fetchError: null,
    loading: true,
    editPopup: false,
    mediaChangeConfirm: false,
    moveSelect: '1',
    movePopup: false,
    summaryLabel: '',
    wordCount: 0,
  };

  async componentDidMount() {
    await this.props.getWeeklySummaries(this.props.asUser || this.props.currentUser.userid);
    const { mediaUrl, weeklySummaries, weeklySummariesCount } = this.props.summaries;
    const summary = (weeklySummaries && weeklySummaries[0] && weeklySummaries[0].summary) || '';
    const summaryLastWeek =
      (weeklySummaries && weeklySummaries[1] && weeklySummaries[1].summary) || '';
    const summaryBeforeLast =
      (weeklySummaries && weeklySummaries[2] && weeklySummaries[2].summary) || '';
    const summaryThreeWeeksAgo =
      (weeklySummaries && weeklySummaries[3] && weeklySummaries[3].summary) || '';

    // Before submitting summaries, count current submits in four weeks
    let submittedCountInFourWeeks = 0;
    if (summary !== '') {
      submittedCountInFourWeeks += 1;
    }
    if (summaryLastWeek !== '') {
      submittedCountInFourWeeks += 1;
    }
    if (summaryBeforeLast !== '') {
      submittedCountInFourWeeks += 1;
    }
    if (summaryThreeWeeksAgo !== '') {
      submittedCountInFourWeeks += 1;
    }

    const dueDateThisWeek = weeklySummaries && weeklySummaries[0] && weeklySummaries[0].dueDate;
    // Make sure server dueDate is not before the localtime dueDate.
    const dueDate = moment(dueDateThisWeek).isBefore(this.state.dueDate)
      ? this.state.dueDate
      : dueDateThisWeek;

    // Calculate due dates for the last three weeks by subtracting 1, 2, and 3 weeks from the current due date
    // and then setting the due date to the end of the ISO week (Saturday) for each respective week
    const dueDateLastWeek = moment(dueDate)
      .subtract(1, 'weeks')
      .startOf('isoWeek')
      .add(5, 'days');
    const dueDateBeforeLast = moment(dueDate)
      .subtract(2, 'weeks')
      .startOf('isoWeek')
      .add(5, 'days');
    const dueDateThreeWeeksAgo = moment(dueDate)
      .subtract(3, 'weeks')
      .startOf('isoWeek')
      .add(5, 'days');

    const uploadDateXWeeksAgo = x => {
      const summaryList = [summary, summaryLastWeek, summaryBeforeLast, summaryThreeWeeksAgo];
      const dueDateList = [dueDate, dueDateLastWeek, dueDateBeforeLast, dueDateThreeWeeksAgo];
      return summaryList[x] !== '' &&
        weeklySummaries &&
        weeklySummaries[x] &&
        weeklySummaries[x].uploadDate
        ? weeklySummaries[x].uploadDate
        : dueDateList[x];
    };
    const uploadDate = uploadDateXWeeksAgo(0);
    const uploadDateLastWeek = uploadDateXWeeksAgo(1);
    const uploadDateBeforeLast = uploadDateXWeeksAgo(2);
    const uploadDateThreeWeeksAgo = uploadDateXWeeksAgo(3);

    this.setState({
      originSummaries: {
        summary,
        summaryLastWeek,
        summaryBeforeLast,
        summaryThreeWeeksAgo,
      },
      formElements: {
        summary,
        summaryLastWeek,
        summaryBeforeLast,
        summaryThreeWeeksAgo,
        mediaUrl: mediaUrl || '',
        weeklySummariesCount: weeklySummariesCount || 0,
        mediaConfirm: false,
      },
      uploadDate,
      uploadDateLastWeek,
      uploadDateBeforeLast,
      uploadDateThreeWeeksAgo,
      dueDate,
      dueDateLastWeek,
      dueDateBeforeLast,
      dueDateThreeWeeksAgo,
      submittedCountInFourWeeks,
      activeTab: '1',
      fetchError: this.props.fetchError,
      loading: this.props.loading,
      editPopup: false,
      mediaChangeConfirm: false,
      moveSelect: '1',
      summaryLabel: 'summary',
      wordCount: 0,
    });
  }

  doesDateBelongToWeek = (dueDate, weekIndex) => {
    const pstStartOfWeek = moment()
      .tz('America/Los_Angeles')
      .startOf('week')
      .subtract(weekIndex, 'week');
    const pstEndOfWeek = moment()
      .tz('America/Los_Angeles')
      .endOf('week')
      .subtract(weekIndex, 'week');
    const fromDate = moment(pstStartOfWeek).toDate();
    const toDate = moment(pstEndOfWeek).toDate();
    return moment(dueDate).isBetween(fromDate, toDate, undefined, '[]');
  };

  toggleTab = tab => {
    const activeTab = this.state.activeTab;
    if (activeTab !== tab) {
      this.setState({ activeTab: tab });
    }
  };

  toggleMovePopup = showPopup => {
    this.setState({movePopup: !showPopup});
  }

  toggleShowPopup = showPopup => {
    const mediaChangeConfirm = this.state.mediaChangeConfirm;
    if (!mediaChangeConfirm){
      this.setState({ editPopup: !showPopup});
    }else{
      this.setState({ editPopup: false});
    }
  };

  handleMoveSelect = moveWeek => {
    const moveSelect= this.state.moveSelect;
    this.setState({ moveSelect: moveWeek, movePopup:true });
  };

  handleMove = () =>{
    const moveSelect = this.state.moveSelect;
    let formElements = {...this.state.formElements};
    const activeTab = this.state.activeTab;
    if (activeTab != moveSelect){
      let movedContent = "";
      switch (activeTab) {
        case "1":
          movedContent = formElements.summary;
          formElements.summary = "";
          break;
        case "2":
          movedContent = formElements.summaryLastWeek;
          formElements.summaryLastWeek = "";
          break;
        case "3":
          movedContent = formElements.summaryBeforeLast;
          formElements.summaryBeforeLast = "";
          break;
        case "4":
          movedContent = formElements.summaryThreeWeeksAgo;
          formElements.summaryThreeWeeksAgo = "";
          break;
      }
      switch (moveSelect) {
        case "1":
          formElements.summary = movedContent;
          break;
        case "2":
          formElements.summaryLastWeek = movedContent;
          break;
        case "3":
          formElements.summaryBeforeLast = movedContent;
          break;
        case "4":
          formElements.summaryThreeWeeksAgo = movedContent;
          break;
      }
    }
    const movePop = this.state.movePopup
    this.toggleMovePopup(movePop);
    this.toggleTab(moveSelect);
    this.setState({formElements});
  };

  // Minimum word count of 50 (handle words that also use non-ASCII characters by counting whitespace rather than word character sequences).
  regexPattern = new RegExp(/^\s*(?:\S+(?:\s+|$)){50,}$/);
  schema = {
    mediaUrl: Joi.string()
      .trim()
      .uri()
      .required()
      .label('Media URL'),
    summary: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'), // Allow empty string OR the minimum word count of 50.
    summaryLastWeek: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'),
    summaryBeforeLast: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'),
    summaryThreeWeeksAgo: Joi.string()
      .allow('')
      .regex(this.regexPattern)
      .label('Minimum 50 words'),
    weeklySummariesCount: Joi.optional(),
    mediaConfirm: Joi.boolean()
      .invalid(false)
      .label('Media Confirm'),
  };

  validate = () => {
    const options = { abortEarly: false };
    const result = Joi.validate(this.state.formElements, this.schema, options);
    if (!result.error) return null;
    const errors = {};
    for (let item of result.error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  validateProperty = ({ name, value, type, checked }) => {
    let attr = type === 'checkbox' ? checked : value;
    const obj = { [name]: attr };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  validateEditorProperty = (content, name) => {
    const obj = { [name]: content };
    const schema = { [name]: this.schema[name] };
    const { error } = Joi.validate(obj, schema);
    return error ? error.details[0].message : null;
  };

  handleInputChange = event => {
    event.persist();
    const { name, value } = event.target;

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(event.target);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const formElements = { ...this.state.formElements };
    formElements[name] = value;
    this.setState({ formElements, errors });
  };
   
  handleMediaChange = event => {
    const mediaChangeConfirm = this.state.mediaChangeConfirm;
    this.setState({ mediaChangeConfirm: true });
    this.toggleShowPopup(this.state.editPopup);
  };

  handleEditorChange = (content) => {
    // Filter out blank pagagraphs inserted by tinymce replacing new line characters. Need those removed so Joi could do word count checks properly.
    if (content.htmlValue !== null) {
      const filteredContent = content.htmlValue.replace(/<p>&nbsp;<\/p>/g, '');
      const errors = { ...this.state.errors };
      const selectedSummaryLabel = this.state.summaryLabel
      const errorMessage = this.validateEditorProperty(filteredContent, selectedSummaryLabel);
      if (errorMessage) errors[selectedSummaryLabel] = errorMessage;
      else delete errors[selectedSummaryLabel];
      this.setState({ wordCount: content.textValue === " " ? 0 : content.textValue.split(" ").length });
      const formElements = { ...this.state.formElements };
      formElements[selectedSummaryLabel] = content.htmlValue;
      this.setState({ formElements, errors });
    }
  };

  handleCheckboxChange = event => {
    event.persist();
    const { name, checked } = event.target;

    const errors = { ...this.state.errors };
    const errorMessage = this.validateProperty(event.target);
    if (errorMessage) errors[name] = errorMessage;
    else delete errors[name];

    const formElements = { ...this.state.formElements };
    formElements[name] = checked;
    this.setState({ formElements, errors });
  };

  handleSave = async event => {
    event.preventDefault();
    // Providing a custom toast id to prevent duplicate.
    const toastIdOnSave = 'toast-on-save';

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    // After submitting summaries, count current submits in four week
    let currentSubmittedCount = 0;
    if (this.state.formElements.summary !== '') {
      currentSubmittedCount += 1;
    }
    if (this.state.formElements.summaryLastWeek !== '') {
      currentSubmittedCount += 1;
    }
    if (this.state.formElements.summaryBeforeLast !== '') {
      currentSubmittedCount += 1;
    }
    if (this.state.formElements.summaryThreeWeeksAgo !== '') {
      currentSubmittedCount += 1;
    }
    // Check whether has newly filled summary
    const diffInSubmittedCount = currentSubmittedCount - this.state.submittedCountInFourWeeks;
    if (diffInSubmittedCount !== 0) {
      this.setState({ summariesCountShowing: this.state.formElements.weeklySummariesCount + 1 });
    }

    let newUploadDate = this.state.uploadDate;
    let newUploadDateLastWeek = this.state.uploadDateLastWeek;
    let newUploadDateBeforeLast = this.state.uploadDateBeforeLast;
    let newUploadDateThreeWeeksAgo = this.state.uploadDateThreeWeeksAgo;
    const originSummaries = { ...this.state.originSummaries };
    if (this.state.formElements.summary !== this.state.originSummaries.summary) {
      newUploadDate = moment()
        .tz('America/Los_Angeles')
        .toISOString();
      originSummaries.summary = this.state.formElements.summary;
      this.setState({ originSummaries, uploadDate: newUploadDate });
    }
    if (this.state.formElements.summaryLastWeek !== this.state.originSummaries.summaryLastWeek) {
      newUploadDateLastWeek = moment()
        .tz('America/Los_Angeles')
        .toISOString();
      originSummaries.summaryLastWeek = this.state.formElements.summaryLastWeek;
      this.setState({ originSummaries, uploadDateLastWeek: newUploadDateLastWeek });
    }
    if (
      this.state.formElements.summaryBeforeLast !== this.state.originSummaries.summaryBeforeLast
    ) {
      newUploadDateBeforeLast = moment()
        .tz('America/Los_Angeles')
        .toISOString();
      originSummaries.summaryBeforeLast = this.state.formElements.summaryBeforeLast;
      this.setState({ originSummaries, uploadDateBeforeLast: newUploadDateBeforeLast });
    }
    if (
      this.state.formElements.summaryThreeWeeksAgo !==
      this.state.originSummaries.summaryThreeWeeksAgo
    ) {
      newUploadDateThreeWeeksAgo = moment()
        .tz('America/Los_Angeles')
        .toISOString();
      originSummaries.summaryThreeWeeksAgo = this.state.formElements.summaryThreeWeeksAgo;
      this.setState({ originSummaries, uploadDateThreeWeeksAgo: newUploadDateThreeWeeksAgo });
    }

    const modifiedWeeklySummaries = {
      mediaUrl: this.state.formElements.mediaUrl.trim(),
      weeklySummaries: [
        {
          summary: this.state.formElements.summary,
          dueDate: this.state.dueDate,
          uploadDate: newUploadDate,
        },
        {
          summary: this.state.formElements.summaryLastWeek,
          dueDate: this.state.dueDateLastWeek,
          uploadDate: newUploadDateLastWeek,
        },
        {
          summary: this.state.formElements.summaryBeforeLast,
          dueDate: this.state.dueDateBeforeLast,
          uploadDate: newUploadDateBeforeLast,
        },
        {
          summary: this.state.formElements.summaryThreeWeeksAgo,
          dueDate: this.state.dueDateThreeWeeksAgo,
          uploadDate: newUploadDateThreeWeeksAgo,
        },
      ],
      weeklySummariesCount: this.state.formElements.weeklySummariesCount + diffInSubmittedCount,
    };

    const updateWeeklySummaries = this.props.updateWeeklySummaries(
      this.props.asUser || this.props.currentUser.userid,
      modifiedWeeklySummaries,
    );
    let saveResult;
    if (updateWeeklySummaries) {
      saveResult = await updateWeeklySummaries();
    }

    if (saveResult === 200) {
      toast.success('✔ The data was saved successfully!', {
        toastId: toastIdOnSave,
        pauseOnFocusLoss: false,
        autoClose: 3000,
      });
      this.props.getUserProfile(this.props.asUser || this.props.currentUser.userid);
      this.props.getWeeklySummaries(this.props.asUser || this.props.currentUser.userid);
      this.props.setPopup(false);
    } else {
      toast.error('✘ The data could not be saved!', {
        toastId: toastIdOnSave,
        pauseOnFocusLoss: false,
        autoClose: 3000,
      });
    }
  };

  render() {
    const {
      formElements,
      dueDate,
      activeTab,
      errors,
      loading,
      fetchError,
      dueDateLastWeek,
      dueDateBeforeLast,
      dueDateThreeWeeksAgo,
    } = this.state;

    // Create an object containing labels for each summary tab:
    // - 'This Week' for the current week's tab
    // - 'Last Week' or the specific date for the last week's tab, depending on whether it belongs to the same week as the due date
    // - 'Week Before Last' or the specific date for the week before the last week's tab, depending on whether it belongs to the same week as the due date
    // - 'Three Weeks Ago' or the specific date for the tab three weeks ago, depending on whether it belongs to the same week as the due date
    const summariesLabels = {
      summary: 'This Week',
      summaryLastWeek: this.doesDateBelongToWeek(dueDateLastWeek, 1)
        ? 'Last Week'
        : moment(dueDateLastWeek).format('YYYY-MMM-DD'),
      summaryBeforeLast: this.doesDateBelongToWeek(dueDateBeforeLast, 2)
        ? 'Week Before Last'
        : moment(dueDateBeforeLast).format('YYYY-MMM-DD'),
      summaryThreeWeeksAgo: this.doesDateBelongToWeek(dueDateThreeWeeksAgo, 3)
        ? 'Three Weeks Ago'
        : moment(dueDateThreeWeeksAgo).format('YYYY-MMM-DD'),
    };

    const wordCount = this.state.wordCount;

    if (fetchError) {
      return (
        <Container>
          <Row className="align-self-center" data-testid="error">
            <Col>
              <Alert color="danger">Fetch error! {fetchError.message}</Alert>
            </Col>
          </Row>
        </Container>
      );
    }

    if (loading) {
      return (
        <Container fluid>
          <Row className="text-center" data-testid="loading">
            <Loading />
          </Row>
        </Container>
      );
    }

    if (this.props.isDashboard) {
      return <DueDateTime isShow={this.props.isPopup} dueDate={moment(dueDate)} />;
    }

    return (
      <Container fluid={this.props.isModal ? true : false} className="bg--white-smoke py-3 mb-5">
        <h3>Weekly Summaries</h3>
        {/* Before clicking Save button, summariesCountShowing is 0 */}
        <div>
          Total submitted:{' '}
          {this.state.summariesCountShowing || this.state.formElements.weeklySummariesCount}
        </div>

        <Form className="mt-4">
          <Nav tabs>
            {Object.values(summariesLabels).map((weekName, i) => {
              let tId = String(i + 1);
              return (
                <NavItem key={tId}>
                  <NavLink
                    className={classnames({ active: activeTab === tId })}
                    data-testid={`tab-${tId}`}
                    onClick={() => {
                      this.toggleTab(tId);
                    }}
                  >
                    {weekName}
                  </NavLink>
                </NavItem>
              );
            })}
          </Nav>
          <TabContent activeTab={activeTab} className="p-2 weeklysummarypane">
            {Object.keys(summariesLabels).map((summaryName, i) => {
              let tId = String(i + 1);
              return (
                <TabPane tabId={tId} key={tId}>
                  <Row>
                    <Col>
                      <FormGroup>
                        <Label for={summaryName} className="summary-instructions-row d-flex p-2 justify-content-between">
                          <div>
                            Enter your weekly summary below. (required){' '}
                            <WeeklySummaryContentTooltip tabId={tId} />
                          </div>
                          <UncontrolledDropdown>
                            <DropdownToggle className="px-5 btn--dark-sea-green" caret>
                              Move This Summary
                            </DropdownToggle>
                            <DropdownMenu>
                            <DropdownItem disabled={activeTab ==='1'} 
                              onClick={()=>this.handleMoveSelect('1')}>
                                This Week
                            </DropdownItem>
                            <DropdownItem disabled={activeTab ==='2'}
                            onClick={()=>this.handleMoveSelect('2')}>
                                Last Week
                            </DropdownItem>
                            <DropdownItem disabled={activeTab ==='3'}
                              onClick={()=>this.handleMoveSelect('3')}>
                                Week Before Last
                            </DropdownItem>
                            <DropdownItem disabled={activeTab ==='4'}
                              onClick={()=>this.handleMoveSelect('4')}>
                                Three Weeks Ago
                            </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                          <CurrentPromptModal />
                        </Label>
                        <Editor
                          style={{
                            height: '180px'
                          }}
                          placeholder='Weekly summary content... Remember to be detailed (50-word minimum) and write it in 3rd person. E.g. “This week John…"'
                          id={summaryName}
                          value={formElements[summaryName]}
                          onTextChange={this.handleEditorChange}
                        />
                        <p>{wordCount} words</p>
                      </FormGroup>
                      {(errors.summary ||
                        errors.summaryLastWeek ||
                        errors.summaryBeforeLast ||
                        errors.summaryThreeWeeksAgo) && (
                        <Alert color="danger">
                          The summary must contain a minimum of 50 words.
                        </Alert>
                      )}
                    </Col>
                  </Row>
                </TabPane>
              );
            })}
            <Row>
              <Col>
                <Label for="mediaUrl" className="mt-1">
                  Link to your media files (eg. DropBox or Google Doc). (required){' '}
                  <MediaURLTooltip />
                </Label>
                <Row form>
                  <Col md={8}>
                    <FormGroup>
                      <Input
                        type="url"
                        name="mediaUrl"
                        id="mediaUrl"
                        data-testid="media-input"
                        placeholder="Enter a link"
                        value={formElements.mediaUrl}
                        onChange={this.handleInputChange}
                      />
                    </FormGroup>
                    {<Modal isOpen={this.state.editPopup}>
                    <ModalHeader> Warning!</ModalHeader>
                    <ModalBody>
                      Whoa Tiger! Are you sure you want to do that?
                      This link was added by an Admin when you were set up as a member 
                      of the team. Only change this if you are SURE your new link is more 
                      than the one already here.

                    </ModalBody>
                    <ModalFooter>
                      <Button checked={this.state.mediaChangeConfirm} onClick={this.handleMediaChange}>
                          Confirm
                      </Button>{' '}
                      <Button onClick={() => this.toggleShowPopup(this.state.editPopup)}>
                          Close
                      </Button>{' '}
                    </ModalFooter>
                  </Modal>} 
                    {errors.mediaUrl && <Alert color="danger">{errors.mediaUrl}</Alert>}
                  </Col>
                  {formElements.mediaUrl && !errors.mediaUrl && (
                    <Col md={4}>
                      <FormGroup className="media-url">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="mx-1 text--silver" />
                        <a href={formElements.mediaUrl} target="_blank" rel="noopener noreferrer">
                          Open link
                        </a>
                      </FormGroup>
                    </Col>
                  )}
                  {<Modal isOpen={this.state.movePopup}
                  toggle={this.toggleMovePopup}>
                    <ModalHeader> Warning!</ModalHeader>
                    <ModalBody>
                      Are you SURE you want to move the summary?
                    </ModalBody>
                    <ModalFooter>
                    <Button 
                      onClick={()=>this.handleMove(this.state.moveSelect)}>Confirm</Button>
                      <Button 
                      onClick={this.toggleMovePopup}>Close</Button>
                    </ModalFooter>
                    </Modal>
                  }
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <CustomInput
                        id="mediaConfirm"
                        name="mediaConfirm"
                        type="checkbox"
                        label="I have provided a minimum of 4 screenshots (6-10 preferred) of this week's work. (required)"
                        htmlFor="mediaConfirm"
                        checked={formElements.mediaConfirm}
                        valid={formElements.mediaConfirm}
                        onChange={this.handleCheckboxChange}
                      />
                    </FormGroup>
                    {errors.mediaConfirm && (
                      <Alert color="danger">
                        Please confirm that you have provided the required media files.
                      </Alert>
                    )}
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col>
                    <FormGroup className="mt-2">
                      <Button
                        className="px-5 btn--dark-sea-green"
                        disabled={this.validate() || !formElements.mediaUrl ? true : false}
                        onClick={this.handleSave}
                      >
                        Save
                      </Button>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
          </TabContent>
        </Form>
      </Container>
    );
  }
}

WeeklySummary.propTypes = {
  currentUser: PropTypes.shape({
    userid: PropTypes.string.isRequired,
  }).isRequired,
  fetchError: PropTypes.any,
  getWeeklySummaries: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  summaries: PropTypes.object.isRequired,
  updateWeeklySummaries: PropTypes.func.isRequired,
};

const mapStateToProps = ({ auth, weeklySummaries }) => ({
  currentUser: auth.user,
  summaries: weeklySummaries?.summaries,
  loading: weeklySummaries.loading,
  fetchError: weeklySummaries.fetchError,
});

const mapDispatchToProps = dispatch => {
  return {
    getWeeklySummaries: getWeeklySummaries,
    updateWeeklySummaries: updateWeeklySummaries,
    getWeeklySummaries: userId => getWeeklySummaries(userId)(dispatch),
    getUserProfile: userId => getUserProfile(userId)(dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WeeklySummary);
