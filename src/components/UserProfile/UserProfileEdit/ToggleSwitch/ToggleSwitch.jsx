import React, {useState} from 'react';
import style from './ToggleSwitch.module.scss';
import TriStateToggleSwitch from './TriStateToggleSwitch';

const ToggleSwitch = ({ switchType, state, handleUserProfile, fontSize, UpdateTeamMembersVisiblity, userId }) => {
  // console.log("hehe",userId);
  const[visiblity,setVisiblity]=useState(true);
  switch (switchType) {
    case 'bluesquares':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              {/* <div> Blue Squares: </div> */}
              <div className={style.switchContainer}>
                public
                <input
                  data-testid="blue-switch"
                  id="blueSquaresPubliclyAccessible"
                  type="checkbox"
                  className={style.toggle}
                  onChange={handleUserProfile}
                />
                private
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            {/* <div> Blue Squares: </div> */}
            <div className={style.switchContainer}>
              public
              <input
                data-testid="blue-switch"
                id="blueSquaresPubliclyAccessible"
                type="checkbox"
                className={style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        </div>
      );
    case 'email':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className="icon">
                <i className="fa fa-envelope-o" aria-hidden="true" />
              </div>
              <div className={style.switchContainer}>
                public
                <input
                  id="emailPubliclyAccessible"
                  data-testid="email-switch"
                  type="checkbox"
                  className={style.toggle}
                  onChange={handleUserProfile}
                />
                private
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className="icon">
              <i className="fa fa-envelope-o" aria-hidden="true" />
            </div>
            <div className={style.switchContainer}>
              public
              <input
                id="emailPubliclyAccessible"
                data-testid="email-switch"
                type="checkbox"
                className={style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        </div>
      );
    case 'phone':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className="icon">
                <i className="fa fa-phone" aria-hidden="true" />
              </div>
              <div className={style.switchContainer}>
                public
                <input
                  data-testid="phone-switch"
                  id="phonePubliclyAccessible"
                  //data-testid="custom-element"
                  type="checkbox"
                  className={style.toggle}
                  onChange={handleUserProfile}
                />
                private
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className="icon">
              <i className="fa fa-phone" aria-hidden="true" />
            </div>
            <div className={style.switchContainer}>
              public
              <input
                data-testid="phone-switch"
                id="phonePubliclyAccessible"
                type="checkbox"
                className={style.toggle}
                defaultChecked
                onChange={handleUserProfile}
              />
              private
            </div>
          </div>
        </div>
      );
    case 'visible':
      if (state) {
        return (
          <div className="blueSqare">
            <div className={style.switchSection}>
              <div className={style.switchContainer}>
                visible
                <input
                  data-testid="visibility-switch"
                  id="leaderboardVisibility"
                  type="checkbox"
                  className={style.toggle}
                  onChange={handleUserProfile}
                />
                invisible
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="blueSqare">
          <div className={style.switchSection}>
            <div className={style.switchContainer}>
              visible
              <input
                data-testid="visibility-switch"
                id="leaderboardVisibility"
                type="checkbox"
                className={style.toggle}
                onChange={handleUserProfile}
                defaultChecked
              />
              invisible
            </div>
          </div>
        </div>
      );
    case 'bio':
      return (
        <div className="blueSqare">
          <div className={style.switchSection} style={{fontSize:fontSize}}>
            <div style={{ wordBreak: 'keep-all'}} className={style.switchContainer}>
            posted
            <TriStateToggleSwitch  
            pos={state || 'default'} 
            onChange={handleUserProfile}/>
            requested
            </div>
          </div>
        </div>
      );
      case 'limit-visiblity':
        return (
            <div className={style.switchSection}>
            <div className={style.switchContainer}>
              {/* Yes */}
              <input
                id="teamVisiblity"
                type="checkbox"
                className={style.toggle}
                onChange={ (event)=>{
                  setVisiblity(event.target.checked);
                  UpdateTeamMembersVisiblity(userId,visiblity);
                }
                }
                defaultChecked
              />
              {/* No */}
            </div>
          </div>
        );
    default:
      break;
  }
  return <div>ERROR: Toggle Switch.</div>;
};

export default ToggleSwitch;
