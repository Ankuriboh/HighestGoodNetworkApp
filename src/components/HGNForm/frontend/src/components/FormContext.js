import React, { createContext, useState, useContext } from "react";

// Context for form data
const FormContext = createContext();

// Provider component to wrap around your app
export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    // PAGE 1: General form fields
    name: "",
    email: "",
    github: "",
    slack: "",

    // PAGE 2: Fields from GeneralQuestions component
    hours: "",
    period: "",
    standup: "",
    location: "",
    manager: "",
    combined_frontend_backend: "",
    combined_skills: "",
    mern_skills: "",
    leadership_skills: "",
    leadership_experience: "",
    preferences: [],
    availability: {},

    // PAGE 3: Frontend form fields
    frontend_Overall: "",
    frontend_HTML: "",
    frontend_Bootstrap: "",
    frontend_CSS: "",
    frontend_React: "",
    frontend_Redux: "",
    frontend_WebSocketCom: "",
    frontend_ResponsiveUI: "",
    frontend_UnitTest: "",
    frontend_Documentation: "",
    frontend_UIUXTools: "",

    // PAGE 4: Backend form fields
    backend_Overall: "",
    backend_Database: "",
    backend_MongoDB: "",
    backend_MongoDB_Advanced: "",
    backend_TestDrivenDev: "",
    backend_Deployment: "",
    backend_VersionControl: "",
    backend_CodeReview: "",
    backend_EnvironmentSetup: "",
    backend_AdvancedCoding: "",
    backend_AgileDevelopment: "",

    // PAGE 5: Follow-up form fields
    followup_platform: "",
    followup_other_skills: "",
    followup_suggestion: "",
    followup_additional_info: "",

    // Slack Name Check
    isSlackSameAsName: "",
  });

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use the context in any component
export const useFormContext = () => {
  return useContext(FormContext);
};
