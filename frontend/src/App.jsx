import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function App() {
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [noteContent, setNoteContent] = useState("");
  const [noteResource, setNoteResource] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, resourceResponse, noteResponse] =
        await Promise.all([
          fetch(`${API}/categories/`),
          fetch(`${API}/resources/`),
          fetch(`${API}/notes/`),
        ]);

      if (!categoryResponse.ok || !resourceResponse.ok || !noteResponse.ok) {
        throw new Error("Could not load data from Django.");
      }

      const [categoryData, resourceData, noteData] = await Promise.all([
        categoryResponse.json(),
        resourceResponse.json(),
        noteResponse.json(),
      ]);

      setCategories(
        Array.isArray(categoryData) ? categoryData : categoryData.results || [],
      );

      setResources(
        Array.isArray(resourceData) ? resourceData : resourceData.results || [],
      );

      setNotes(Array.isArray(noteData) ? noteData : noteData.results || []);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to Django. Check that your backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddCategory(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/categories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setCategories((previous) => [...previous, data]);
      setCategoryName("");
      setCategoryDescription("");
      setMessage("Category added successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Could not add category. Check the browser console.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddResource(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/resources/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          category: Number(category),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setResources((previous) => [...previous, data]);
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("");
      setMessage("Study resource added successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Could not add resource. Check the browser console.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/notes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent.trim(),
          resource: Number(noteResource),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setNotes((previous) => [...previous, data]);
      setNoteContent("");
      setNoteResource("");
      setMessage("Study note added successfully!");
    } catch (err) {
      console.error("Add note error:", err);
      setMessage("Could not add note. Check the browser console.");
    } finally {
      setSaving(false);
    }
  }

  const handleDeleteNote = async (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/notes/${noteId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      setNotes((previousNotes) =>
        previousNotes.filter((note) => note.id !== noteId),
      );

      setMessage("Note deleted successfully!");
      setError("");
    } catch (err) {
      setError("Unable to delete note. Please try again.");
      setMessage("");
    }
  };
  const getResourceTitle = (resourceId) => {
    const resource = resources.find((item) => item.id === Number(resourceId));

    return resource ? resource.title : "Study Note";
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Study Resource Organizer</h1>
        <p>Organize your learning. Keep growing.</p>
      </header>

      <main className="container">
        <section className="welcome">
          <h2>Welcome to your Study Dashboard!</h2>
          <p>Manage your subjects and learning resources in one place.</p>
        </section>

        {loading && <p className="message">Loading your study data...</p>}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <section className="stats">
              <div className="card">
                <h3>Categories</h3>
                <p className="number">{categories.length}</p>
              </div>

              <div className="card">
                <h3>Study Resources</h3>
                <p className="number">{resources.length}</p>
              </div>

              <div className="card">
                <h3>Study Notes</h3>
                <p className="number">{notes.length}</p>
              </div>
            </section>

            <section className="section">
              <h2>Add New Category</h2>
              <form className="form-card" onSubmit={handleAddCategory}>
                <label htmlFor="categoryName">Category Name</label>
                <input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Django"
                  required
                />

                <label htmlFor="categoryDescription">Description</label>
                <textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows="3"
                />

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Add Category"}
                </button>
              </form>
            </section>

            <section className="section">
              <h2>Add Study Resource</h2>
              <form className="form-card" onSubmit={handleAddResource}>
                <label htmlFor="resourceTitle">Resource Title</label>
                <input
                  id="resourceTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. React Tutorial"
                  required
                />

                <label htmlFor="resourceUrl">Resource URL</label>
                <input
                  id="resourceUrl"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />

                <label htmlFor="resourceDescription">Description</label>
                <textarea
                  id="resourceDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this resource"
                  rows="3"
                />

                <label htmlFor="resourceCategory">Category</label>
                <select
                  id="resourceCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Add Study Resource"}
                </button>
              </form>
            </section>

            <section className="section">
              <h2>Add Study Note</h2>
              <form className="form-card" onSubmit={handleAddNote}>
                <label htmlFor="noteContent">Note Content</label>
                <textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write what you learned..."
                  rows="5"
                  required
                />

                <label htmlFor="noteResource">Related Study Resource</label>
                <select
                  id="noteResource"
                  value={noteResource}
                  onChange={(e) => setNoteResource(e.target.value)}
                  required
                >
                  <option value="">Select a study resource</option>
                  {resources.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>

                <button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Study Note"}
                </button>
              </form>
            </section>

            {message && (
              <p className="message" role="status">
                {message}
              </p>
            )}

            <section className="section">
              <h2>My Categories</h2>
              <div className="grid">
                {categories.map((item) => (
                  <article className="card" key={item.id}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>My Study Resources</h2>
              <div className="grid">
                {resources.map((resource) => (
                  <article className="card" key={resource.id}>
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <p>
                      Category:{" "}
                      {categories.find((item) => item.id === resource.category)
                        ?.name || "Other"}
                    </p>
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      Open Resource
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className="section">
              <h2>My Study Notes</h2>
              {notes.length === 0 ? (
                <p>No notes added yet.</p>
              ) : (
                <div className="grid">
                  {notes.map((note) => (
                    <article className="card" key={note.id}>
                      <h3>{getResourceTitle(note.resource)}</h3>

                      <p>{note.content}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
