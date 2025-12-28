import { Wrapper, Status } from "@googlemaps/react-wrapper";

const render = (status: Status): ReactElement => {
  if (status === Status.LOADING) return <Spinner />;
  if (status === Status.FAILURE) return <ErrorComponent />;
  return null;
};

const MyApp = () => (
  <Wrapper apiKey={"YOUR_API_KEY"} render={render}>
    <MyMapComponent />
  </Wrapper>
);
