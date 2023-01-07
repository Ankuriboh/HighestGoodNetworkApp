/* eslint-disable import/prefer-default-export */
/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import classnames from 'classnames';
import './ReportBlock.css';

export function ReportBlock({
  className, children, firstColor, secondColor,
}) {
  const color = secondColor ? `linear-gradient(to bottom right, ${firstColor}, ${secondColor})` : firstColor;

  return (
    <div className={classnames('report-block-wrapper', className)}>
      <div className="report-block-content" style={{ background: color || 'white' }}>
        {children}
      </div>
    </div>
  );
}
