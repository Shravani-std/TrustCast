import { useParams } from "react-router-dom";
import DeviceDetailsContainer from "./DeviceDetailsContainer";

const DeviceDetailsContainerWrapper = () => {
  const { ip } = useParams();

  return <DeviceDetailsContainer selectedIP={ip} />;
};

export default DeviceDetailsContainerWrapper;