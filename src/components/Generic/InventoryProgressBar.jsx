import ProgressBar from "react-bootstrap/ProgressBar";
import { calculatePercentage } from "../../config_and_helpers/helpers";

/**
 * Renders a progress bar component with the given currentValue and totalValue.
 * The value of the progress bar represents the percentage of currentValue compared to totalValue.
 *
 * @param {Object} props - The props object containing currentValue and totalValue.
 * @param {number} props.currentValue - The current value for the progress bar.
 * @param {number} props.totalValue - The total value for the progress bar.
 * @returns {JSX.Element} - The rendered progress bar component.
 */
export const InventoryProgressBar = ({ currentValue, totalValue }) => {
  //   Calculate the percentage between the totalValue constant and the currentValue variable
  //   for the "now" prop of the progress bar
  const currentPercentage = calculatePercentage(totalValue, currentValue);

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
      label={`${currentValue}/${Number(totalValue)}`} // The label of the bar format: 3/10
    />
  );
};

export default InventoryProgressBar;
