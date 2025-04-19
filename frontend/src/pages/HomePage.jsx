import ImageUploader from "../components/ImageUploader";

function HomePage() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <ImageUploader buildId={8} />
    </div>
  );
}

export default HomePage;
