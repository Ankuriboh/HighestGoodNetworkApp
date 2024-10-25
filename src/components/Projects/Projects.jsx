import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  fetchAllProjects,
  clearError,
} from '../../actions/projects';
import { getProjectsByUsersName } from '../../actions/userProfile';
import { getPopupById } from '../../actions/popupEditorAction';
import Overview from './Overview';
import AddProject from './AddProject';
import ProjectTableHeader from './ProjectTableHeader';
import Project from './Project';
import './projects.css';
import Loading from '../common/Loading';
import hasPermission from '../../utils/permissions';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';
import SearchProjectByPerson from 'components/SearchProjectByPerson/SearchProjectByPerson';
import ModalTemplate from './../common/Modal';

const Projects = function(props) {
  const role = props.state.userProfile.role;
  const { darkMode } = props.state.theme;
  const numberOfProjects = props.state.allProjects.projects.length;
  const numberOfActive = props.state.allProjects.projects.filter(project => project.isActive).length;
  const { fetching, fetched, status, error } = props.state.allProjects;
    const initialModalData = {
    showModal: false,
    modalMessage: "",
    modalTitle: "ERROR",
  };
  const [modalData, setModalData] = useState(initialModalData);
  const [categorySelectedForSort, setCategorySelectedForSort] = useState("");
  const [showStatus, setShowStatus] = useState("");
  const [sortedByName, setSortedByName] = useState("");
  const [projectList, setProjectList] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [allProjects, setAllProjects] = useState(null);

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  };

  const debouncedSearchName = useDebounce(searchName, 300);

  const canPostProject = props.hasPermission('postProject');


  const onChangeCategory = (value) => {
    setCategorySelectedForSort(value);
  };

  const onSelectStatus = (value) => {
    setShowStatus(value);
  }

  const handleSort = (e) => {
    const clickedId = e.target.id;
    setSortedByName(prevState => prevState === clickedId ? "" : clickedId);
  }

  const postProject = async (name, category) => {
    await props.postNewProject(name, category);
    refreshProjects(); // Refresh project list after adding a project
  };

  const onCloseModal = () => {
    setModalData(initialModalData);
    props.clearError();
  };

  const handleProjectArchived = () => {
    props.fetchAllProjects();
  };

  const generateProjectList = (categorySelectedForSort, showStatus, sortedByName) => {
    const { projects } = props.state.allProjects;
    const filteredProjects = projects.filter(project => !project.isArchived)
      .filter(project => {
      if (categorySelectedForSort && showStatus){
        return project.category === categorySelectedForSort && project.isActive === showStatus;
      } else if (categorySelectedForSort) {
        return project.category === categorySelectedForSort;
      } else if (showStatus) {
        return project.isActive === showStatus;
      } else {
        return true;
      }
    }).sort((a, b) => {
      if (sortedByName === "Ascending") {
        return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? -1 : 1;
      } else if (sortedByName === "Descending") {
        return a.projectName[0].toLowerCase() < b.projectName[0].toLowerCase() ? 1 : -1;
      } else if (sortedByName === "SortingByRecentEditedMembers") {
        return a.membersModifiedDatetime < b.membersModifiedDatetime ? 1 : -1;
      } else {
        return 0;
      }
    }).map((project, index) => (
        <Project
          key={project._id}
          index={index}
          projectData={project}
          darkMode={darkMode}
          onProjectArchived={handleProjectArchived}
        />
    ));
    setProjectList(filteredProjects);
    setAllProjects(filteredProjects);
  }

  const refreshProjects = async () => {
    await props.fetchAllProjects();
  };

  useEffect(() => {
    props.fetchAllProjects();
  }, []);

  useEffect(() => {
    generateProjectList(categorySelectedForSort, showStatus, sortedByName);
    if (status !== 200) {
      setModalData({
        showModal: true,
        modalMessage: error,
        modalTitle: 'ERROR',
        hasConfirmBtn: false,
        hasInactiveBtn: false,
      });
    }
  }, [categorySelectedForSort, showStatus, sortedByName, props.state.allProjects, props.state.theme.darkMode]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (debouncedSearchName) {
        const projects = await props.getProjectsByUsersName(debouncedSearchName);
        if (projects) {
          const newProjectList = allProjects.filter(project => 
            projects.some(p => p === project.key)
          );
          setProjectList(newProjectList);
        } else {
          setProjectList(allProjects);
        }
      } else {
        setProjectList(allProjects);
      }
    };
    fetchProjects();
  }, [debouncedSearchName]);

  const handleSearchName = (searchNameInput) => {
    setSearchName(searchNameInput);
  };

  return (
    <>
      <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
        <div className="container py-3">
          {fetching || !fetched ? <Loading align="center" /> : null}
          <div className="d-flex align-items-center">
            <h3 style={{ display: 'inline-block', marginRight: 10 }}>Projects</h3>
            <EditableInfoModal
              areaName="projectsInfoModal"
              areaTitle="Projects"
              fontSize={30}
              isPermissionPage={true}
              role={role}
            />
            <Overview numberOfProjects={numberOfProjects} numberOfActive={numberOfActive} />

            {canPostProject ? <AddProject hasPermission={hasPermission} /> : null}
          </div>

          <SearchProjectByPerson onSearch={handleSearchName} />

          <table className="table table-bordered table-responsive-sm">
            <thead>
              <ProjectTableHeader 
                onChange={onChangeCategory} 
                selectedValue={categorySelectedForSort} 
                showStatus={showStatus} 
                selectStatus={onSelectStatus}
                sorted={sortedByName}
                handleSort={handleSort}
                darkMode={darkMode}
              />
            </thead>
            <tbody className={darkMode ? 'bg-yinmn-blue dark-mode' : ''}>
              {projectList}
            </tbody>
          </table>
        </div>

      </div>
        <ModalTemplate
          isOpen={modalData.showModal}
          closeModal={onCloseModal}
          modalMessage={modalData.modalMessage}
          modalTitle={modalData.modalTitle}
        />
    </>
  );
}

const mapStateToProps = state => {
  return { state };
};

export default connect(mapStateToProps, {
  fetchAllProjects,
  clearError,
  getPopupById,
  hasPermission,
  getProjectsByUsersName
})(Projects);
