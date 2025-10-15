export const metadata = { title: 'Create Job' };

export default function CreateJobPage() {
  return (
    <main className="center-viewport">
      <form className="container-card form-grid" aria-label="Work order form">
        <h1 className="header-title">Create work order</h1>
        <p className="header-subtitle">Provide job details</p>

        <div className="form-field">
          <label className="form-label" htmlFor="title">Title</label>
          <input className="text-input" id="title" name="title" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="category">Category</label>
          <select className="select-input" id="category" name="category" required>
            <option value="installation">Installation</option>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="scheduledAt">Scheduled date</label>
          <input className="text-input" type="datetime-local" id="scheduledAt" name="scheduledAt" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="location">Location</label>
          <input className="text-input" id="location" name="location" required />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea className="textarea-input" id="notes" name="notes" />
        </div>

        <button className="primary-button" type="submit">Submit work order</button>
      </form>
    </main>
  );
}
