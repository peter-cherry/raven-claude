export const metadata = { title: 'Technician Sign Up' };

export default function TechnicianSignupPage() {
  return (
    <main className="center-viewport">
      <form className="container-card form-grid" aria-label="Technician registration form">
        <h1 className="header-title">Technician registration</h1>
        <p className="header-subtitle">Join the network</p>

        <div className="form-field">
          <label className="form-label" htmlFor="fullName">Full name</label>
          <input className="text-input" id="fullName" name="fullName" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="email">Email</label>
          <input className="text-input" type="email" id="email" name="email" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="phone">Phone</label>
          <input className="text-input" type="tel" id="phone" name="phone" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="skills">Primary skills</label>
          <input className="text-input" id="skills" name="skills" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="bio">Bio</label>
          <textarea className="textarea-input" id="bio" name="bio" />
        </div>

        <button className="primary-button" type="submit">Create profile</button>
      </form>
    </main>
  );
}
