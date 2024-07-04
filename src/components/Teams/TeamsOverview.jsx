import React from 'react';
import { TOTAL_TEAMS, ACTIVE_TEAMS } from '../../languages/en/ui';
// Sai Sarath Kumar Alavakonda working on TEAMS UI , 3 july 2024
import './TeamsOverview.css';   //added by me

export const TeamsOverview = ({numberOfTeams, numberOfActiveTeams}) => {
  return (
    <div className="teams__overview--top">
      <div className="card" id="card_team" data-testid="card_team">
        <div className="card-body">
          <h4 className="card-title">{numberOfTeams}</h4>
          <h6 className="card-subtitle">
            <i className="fa fa-users" aria-hidden="true"></i> {TOTAL_TEAMS}
          </h6>
        </div>
      </div>

      <div className="card" id="card_active" data-testid="card_active">
        <div className="card-body">
          <h4 className="card-title">{numberOfActiveTeams}</h4>
          <h6 className="card-subtitle">
            {/* <div className="isActive"> */}
              <i className="fa fa-circle fa-circle-isActive" aria-hidden="true"></i> {ACTIVE_TEAMS}
            {/* </div> */}
          </h6>
        </div>
      </div>
    </div>
  );
};

export default TeamsOverview;
