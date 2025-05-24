import "animate.css";

function HomePage({ darkMode }) {
  const themeClasses = darkMode ? "bg-dark text-light" : "bg-light text-dark";

  return (
    <div className="container-fluid p-0">
      {/* Hero Section */}
      <section className={`text-center py-5 ${themeClasses}`}>
        <h1 className="display-3 fw-bold animate__animated animate__fadeInUp">
          Click To Flip
        </h1>
        <p className="lead animate__animated animate__fadeInUp animate__delay-1s">
          Track. Flip. Profit. Simplify your PC flipping game.
        </p>
        <a
          href="/dashboard"
          className="btn btn-primary btn-lg mt-3 animate__animated animate__fadeInUp animate__delay-2s"
        >
          Start Flipping Now
        </a>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <h2 className="text-center mb-5 fw-bold">
          Why Choose <span className="text-primary">Click To Flip</span>?
        </h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <i className="bi bi-graph-up-arrow display-4 text-success"></i>
            <h4 className="mt-3 fw-semibold">Profit Tracking</h4>
            <p className="text-muted">
              Stay on top of margins and maximise your returns.
            </p>
          </div>
          <div className="col-md-4 mb-4">
            <i className="bi bi-tools display-4 text-warning"></i>
            <h4 className="mt-3 fw-semibold">Component Management</h4>
            <p className="text-muted">
              Manage builds and parts efficiently with ease.
            </p>
          </div>
          <div className="col-md-4 mb-4">
            <i className="bi bi-bar-chart-steps display-4 text-info"></i>
            <h4 className="mt-3 fw-semibold">Visual Insights</h4>
            <p className="text-muted">
              Analyse trends with charts and visual breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-5 ${themeClasses}`}>
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">How It Works</h2>
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <i className="bi bi-plus-circle-fill display-4 text-primary"></i>
              <h5 className="mt-3 fw-semibold">1. Add a Build</h5>
              <p className="text-muted">
                Enter components, prices, and create a build profile.
              </p>
            </div>
            <div className="col-md-4 mb-4">
              <i className="bi bi-pencil-square display-4 text-warning"></i>
              <h5 className="mt-3 fw-semibold">2. Track Progress</h5>
              <p className="text-muted">
                Monitor upgrades, costs, and key milestones.
              </p>
            </div>
            <div className="col-md-4 mb-4">
              <i className="bi bi-currency-pound display-4 text-success"></i>
              <h5 className="mt-3 fw-semibold">3. Sell & Profit</h5>
              <p className="text-muted">
                Log the sale and instantly calculate your earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-center py-3 ${themeClasses}`}>
        <small>&copy; {new Date().getFullYear()} Click To Flip.</small>
      </footer>
    </div>
  );
}

export default HomePage;
