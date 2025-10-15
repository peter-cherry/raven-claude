export const metadata = { title: 'Technician Registration - Ravensearch' };

export default function TechnicianSignupPage() {
  return (
    <main className="content-area">
      <div className="content-inner center-viewport">
        <form className="container-card" aria-label="Technician registration form">
          <h1 className="header-title">Join as technician</h1>
          <p className="header-subtitle">Register your profile to receive work orders</p>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="fullName">Full name</label>
              <input className="text-input" id="fullName" name="fullName" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="email">Email address</label>
              <input className="text-input" type="email" id="email" name="email" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="phone">Phone number</label>
              <input className="text-input" type="tel" id="phone" name="phone" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="skills">Primary skills</label>
              <input className="text-input" id="skills" name="skills" placeholder="e.g., HVAC, Electrical, Plumbing" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="bio">Professional bio</label>
              <textarea className="textarea-input" id="bio" name="bio" placeholder="Tell us about your experience and expertise..." />
            </div>

            <button className="primary-button" type="submit">Create technician profile</button>
          </div>
        </form>
      </div>
    </main>
  );
}
