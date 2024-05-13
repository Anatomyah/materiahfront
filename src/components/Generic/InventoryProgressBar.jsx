import ProgressBar from "react-bootstrap/ProgressBar";

/**
 * Renders a ProgressBar component with a label based on the currentPercentage prop.
 *
 * @param {Object} props - The props object.
 * @param {number} props.currentPercentage - The current percentage value.
 *
 * @return {JSX.Element} - The rendered ProgressBar component.
 */
export const InventoryProgressBar = ({ currentPercentage }) => {
  return (
    <ProgressBar
      animated
      striped
      variant={
        currentPercentage > 50
          ? "success"
          : currentPercentage > 30
          ? "warning"
          : "danger"
      }
      now={currentPercentage}
      label={`${currentPercentage}%`}
    />
  );
};

export default InventoryProgressBar;
