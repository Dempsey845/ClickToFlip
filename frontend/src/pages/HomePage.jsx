import AutocompleteInput from "../components/AutocompleteInput";

function HomePage() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <AutocompleteInput type="CPU" />
      <AutocompleteInput type="GPU" />
      <AutocompleteInput type="Motherboard" />
    </div>
  );
}

export default HomePage;
