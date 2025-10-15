export const metadata = { title: 'Create Work Order - Ravensearch' };

export default function CreateJobPage() {
  return (
    <main className="content-area">
      <div className="content-inner center-viewport">
        <form className="container-card" aria-label="Work order form">
          <h1 className="header-title">Create work order</h1>
          <p className="header-subtitle">Provide job details for technician assignment</p>

          <div className="form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="title">Work order title</label>
              <input className="text-input" id="title" name="title" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="category">Category</label>
              <select className="select-input" id="category" name="category" required>
                <option value="">Select category</option>
                <option value="installation">Installation</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="scheduledAt">Scheduled date & time</label>
              <input className="text-input" type="datetime-local" id="scheduledAt" name="scheduledAt" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="location">Location</label>
              <input className="text-input" id="location" name="location" placeholder="Address or coordinates" required />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="notes">Additional notes</label>
              <textarea className="textarea-input" id="notes" name="notes" placeholder="Any special instructions or requirements..." />
            </div>

            <button className="primary-button" type="submit">Submit work order</button>
          </div>
        </form>
      </div>
    </main>
  );
}
