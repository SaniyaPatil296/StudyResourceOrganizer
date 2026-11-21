import { useEffect, useState } from "react";
import Auth from "./Auth";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function App() {
  // Authentication state
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") || "",
  );

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser")) || null;
    } catch {
      return null;
    }
  });

  // Dashboard data
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [notes, setNotes] = useState([]);

  // General state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Add category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  // Add resource form
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // Add note form
  const [noteContent, setNoteContent] = useState("");
  const [noteResource, setNoteResource] = useState("");

  // Edit category state
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryDescription, setEditingCategoryDescription] =
    useState("");

  // Edit resource state
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editingResourceTitle, setEditingResourceTitle] = useState("");
  const [editingResourceUrl, setEditingResourceUrl] = useState("");
  const [editingResourceDescription, setEditingResourceDescription] =
    useState("");
  const [editingResourceCategory, setEditingResourceCategory] = useState("");

  // Edit note state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");
  const [editingNoteResource, setEditingNoteResource] = useState("");

  // Login handler
  function handleLogin(data) {
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    setAccessToken(data.access);
    setCurrentUser(data.user);
    setError("");
    setMessage("");
  }

  // Logout handler
  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");

    setAccessToken("");
    setCurrentUser(null);

    setCategories([]);
    setResources([]);
    setNotes([]);

    setError("");
    setMessage("");
    setLoading(true);
  }

  // Refresh expired access token
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      handleLogout();
      throw new Error("Your session has expired. Please log in again.");
    }

    try {
      const response = await fetch(`${API}/auth/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.access) {
        throw new Error("Session expired");
      }

      localStorage.setItem("accessToken", data.access);
      setAccessToken(data.access);

      return data.access;
    } catch {
      handleLogout();
      throw new Error("Your session has expired. Please log in again.");
    }
  }

  // Common authenticated API request
  async function apiFetch(path, options = {}) {
    let token = accessToken;

    const makeRequest = (currentToken) => {
      return fetch(`${API}/${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${currentToken}`,
        },
      });
    };

    let response = await makeRequest(token);

    // Refresh token if access token expires
    if (response.status === 401) {
      token = await refreshAccessToken();
      response = await makeRequest(token);
    }

    if (response.status === 401) {
      handleLogout();
      throw new Error("Please log in again.");
    }

    return response;
  }

  // Load dashboard data
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [categoryResponse, resourceResponse, noteResponse] =
        await Promise.all([
          apiFetch("categories/"),
          apiFetch("resources/"),
          apiFetch("notes/"),
        ]);

      if (!categoryResponse.ok || !resourceResponse.ok || !noteResponse.ok) {
        throw new Error("Could not load dashboard data.");
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
      console.error("Load dashboard error:", err);
      setError(err.message || "Unable to load your study data.");
    } finally {
      setLoading(false);
    }
  }

  // Load data when logged in
  useEffect(() => {
    if (accessToken) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  // ==========================================
  // CATEGORY CRUD
  // ==========================================

  // Add category
  async function handleAddCategory(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch("categories/", {
        method: "POST",
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
      console.error("Add category error:", err);
      setError(err.message || "Could not add category.");
    } finally {
      setSaving(false);
    }
  }

  // Update category
  async function handleUpdateCategory(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`categories/${editingCategoryId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingCategoryName.trim(),
          description: editingCategoryDescription.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setCategories((previous) =>
        previous.map((item) => (item.id === editingCategoryId ? data : item)),
      );

      setEditingCategoryId(null);
      setEditingCategoryName("");
      setEditingCategoryDescription("");

      setMessage("Category updated successfully!");
    } catch (err) {
      console.error("Update category error:", err);
      setError(err.message || "Could not update category.");
    } finally {
      setSaving(false);
    }
  }

  // Delete category
  async function handleDeleteCategory(categoryId) {
    const confirmed = window.confirm(
      "Deleting this category will also delete its related study resources and notes. Are you sure?",
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`categories/${categoryId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category.");
      }

      const deletedResourceIds = resources
        .filter((resource) => Number(resource.category) === Number(categoryId))
        .map((resource) => Number(resource.id));

      setCategories((previous) =>
        previous.filter((item) => item.id !== categoryId),
      );

      setResources((previous) =>
        previous.filter(
          (resource) => Number(resource.category) !== Number(categoryId),
        ),
      );

      setNotes((previous) =>
        previous.filter(
          (note) => !deletedResourceIds.includes(Number(note.resource)),
        ),
      );

      if (editingCategoryId === categoryId) {
        setEditingCategoryId(null);
      }

      setMessage("Category and its related records deleted successfully!");
    } catch (err) {
      console.error("Delete category error:", err);
      setError(err.message || "Could not delete category.");
    }
  }

  // ==========================================
  // STUDY RESOURCE CRUD
  // ==========================================

  // Add resource
  async function handleAddResource(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch("resources/", {
        method: "POST",
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
      console.error("Add resource error:", err);
      setError(err.message || "Could not add resource.");
    } finally {
      setSaving(false);
    }
  }

  // Update resource
  async function handleUpdateResource(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`resources/${editingResourceId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingResourceTitle.trim(),
          url: editingResourceUrl.trim(),
          description: editingResourceDescription.trim(),
          category: Number(editingResourceCategory),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setResources((previous) =>
        previous.map((resource) =>
          resource.id === editingResourceId ? data : resource,
        ),
      );

      setEditingResourceId(null);
      setEditingResourceTitle("");
      setEditingResourceUrl("");
      setEditingResourceDescription("");
      setEditingResourceCategory("");

      setMessage("Study resource updated successfully!");
    } catch (err) {
      console.error("Update resource error:", err);
      setError(err.message || "Could not update resource.");
    } finally {
      setSaving(false);
    }
  }

  // Delete resource
  async function handleDeleteResource(resourceId) {
    const confirmed = window.confirm(
      "Deleting this resource will also delete its related study notes. Are you sure?",
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`resources/${resourceId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete study resource.");
      }

      setResources((previous) =>
        previous.filter((resource) => resource.id !== resourceId),
      );

      setNotes((previous) =>
        previous.filter((note) => Number(note.resource) !== Number(resourceId)),
      );

      if (editingResourceId === resourceId) {
        setEditingResourceId(null);
      }

      setMessage("Study resource and its notes deleted successfully!");
    } catch (err) {
      console.error("Delete resource error:", err);
      setError(err.message || "Could not delete study resource.");
    }
  }

  // ==========================================
  // STUDY NOTE CRUD
  // ==========================================

  // Add note
  async function handleAddNote(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch("notes/", {
        method: "POST",
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
      setError(err.message || "Could not add study note.");
    } finally {
      setSaving(false);
    }
  }

  // Update note
  async function handleUpdateNote(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`notes/${editingNoteId}/`, {
        method: "PATCH",
        body: JSON.stringify({
          content: editingNoteContent.trim(),
          resource: Number(editingNoteResource),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setNotes((previous) =>
        previous.map((note) => (note.id === editingNoteId ? data : note)),
      );

      setEditingNoteId(null);
      setEditingNoteContent("");
      setEditingNoteResource("");

      setMessage("Study note updated successfully!");
    } catch (err) {
      console.error("Update note error:", err);
      setError(err.message || "Could not update study note.");
    } finally {
      setSaving(false);
    }
  }

  // Delete note
  async function handleDeleteNote(noteId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await apiFetch(`notes/${noteId}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note.");
      }

      setNotes((previous) => previous.filter((note) => note.id !== noteId));

      setMessage("Note deleted successfully!");
    } catch (err) {
      console.error("Delete note error:", err);
      setError(err.message || "Unable to delete note.");
    }
  }

  // Get resource title for a note
  const getResourceTitle = (resourceId) => {
    const resource = resources.find(
      (item) => Number(item.id) === Number(resourceId),
    );

    return resource ? resource.title : "Study Note";
  };

  // Show login page when logged out
  if (!accessToken) {
    return <Auth onLogin={handleLogin} />;
  }

  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>Study Resource Organizer</h1>
        <p>Organize your learning. Keep growing.</p>

        <p>
          Welcome, <strong>{currentUser?.username || "Student"}</strong>
        </p>

        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="container">
        {/* Welcome */}
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
            {/* Dashboard statistics */}
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

            {/* Add category */}
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

            {/* Add study resource */}
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

            {/* Add study note */}
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

            {/* Status message */}
            {message && (
              <p className="message" role="status">
                {message}
              </p>
            )}

            {/* ==================================
                MY CATEGORIES
            ================================== */}
            <section className="section">
              <h2>My Categories</h2>

              {categories.length === 0 ? (
                <p>No categories added yet.</p>
              ) : (
                <div className="grid">
                  {categories.map((item) => (
                    <article className="card" key={item.id}>
                      {editingCategoryId === item.id ? (
                        <form onSubmit={handleUpdateCategory}>
                          <h3>Edit Category</h3>

                          <label>Category Name</label>

                          <input
                            value={editingCategoryName}
                            onChange={(e) =>
                              setEditingCategoryName(e.target.value)
                            }
                            required
                          />

                          <label>Description</label>

                          <textarea
                            value={editingCategoryDescription}
                            onChange={(e) =>
                              setEditingCategoryDescription(e.target.value)
                            }
                            rows="3"
                          />

                          <button type="submit" disabled={saving}>
                            {saving ? "Updating..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditingCategoryName("");
                              setEditingCategoryDescription("");
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <h3>{item.name}</h3>
                          <p>{item.description}</p>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(item.id);
                              setEditingCategoryName(item.name);
                              setEditingCategoryDescription(
                                item.description || "",
                              );
                            }}
                          >
                            Edit Category
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(item.id)}
                          >
                            Delete Category
                          </button>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ==================================
                MY STUDY RESOURCES
            ================================== */}
            <section className="section">
              <h2>My Study Resources</h2>

              {resources.length === 0 ? (
                <p>No study resources added yet.</p>
              ) : (
                <div className="grid">
                  {resources.map((resource) => (
                    <article className="card" key={resource.id}>
                      {editingResourceId === resource.id ? (
                        <form onSubmit={handleUpdateResource}>
                          <h3>Edit Study Resource</h3>

                          <label>Resource Title</label>

                          <input
                            value={editingResourceTitle}
                            onChange={(e) =>
                              setEditingResourceTitle(e.target.value)
                            }
                            required
                          />

                          <label>Resource URL</label>

                          <input
                            type="url"
                            value={editingResourceUrl}
                            onChange={(e) =>
                              setEditingResourceUrl(e.target.value)
                            }
                            required
                          />

                          <label>Description</label>

                          <textarea
                            value={editingResourceDescription}
                            onChange={(e) =>
                              setEditingResourceDescription(e.target.value)
                            }
                            rows="3"
                          />

                          <label>Category</label>

                          <select
                            value={editingResourceCategory}
                            onChange={(e) =>
                              setEditingResourceCategory(e.target.value)
                            }
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
                            {saving ? "Updating..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingResourceId(null);
                              setEditingResourceTitle("");
                              setEditingResourceUrl("");
                              setEditingResourceDescription("");
                              setEditingResourceCategory("");
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <h3>{resource.title}</h3>

                          <p>{resource.description}</p>

                          <p>
                            Category:{" "}
                            {categories.find(
                              (item) =>
                                Number(item.id) === Number(resource.category),
                            )?.name || "Other"}
                          </p>

                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Resource
                          </a>

                          <br />
                          <br />

                          <button
                            type="button"
                            onClick={() => {
                              setEditingResourceId(resource.id);
                              setEditingResourceTitle(resource.title);
                              setEditingResourceUrl(resource.url);
                              setEditingResourceDescription(
                                resource.description || "",
                              );
                              setEditingResourceCategory(
                                String(resource.category),
                              );
                            }}
                          >
                            Edit Resource
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            Delete Resource
                          </button>
                        </>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ==================================
                MY STUDY NOTES
            ================================== */}
            <section className="section">
              <h2>My Study Notes</h2>

              {notes.length === 0 ? (
                <p>No notes added yet.</p>
              ) : (
                <div className="grid">
                  {notes.map((note) => (
                    <article className="card" key={note.id}>
                      {editingNoteId === note.id ? (
                        <form onSubmit={handleUpdateNote}>
                          <h3>Edit Study Note</h3>

                          <label>Note Content</label>

                          <textarea
                            value={editingNoteContent}
                            onChange={(e) =>
                              setEditingNoteContent(e.target.value)
                            }
                            rows="5"
                            required
                          />

                          <label>Related Study Resource</label>

                          <select
                            value={editingNoteResource}
                            onChange={(e) =>
                              setEditingNoteResource(e.target.value)
                            }
                            required
                          >
                            <option value="">Select a study resource</option>

                            {resources.map((resource) => (
                              <option key={resource.id} value={resource.id}>
                                {resource.title}
                              </option>
                            ))}
                          </select>

                          <button type="submit" disabled={saving}>
                            {saving ? "Updating..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingNoteContent("");
                              setEditingNoteResource("");
                            }}
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <>
                          <h3>{getResourceTitle(note.resource)}</h3>

                          <p>{note.content}</p>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setEditingNoteContent(note.content);
                              setEditingNoteResource(String(note.resource));
                            }}
                          >
                            Edit Note
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            Delete Note
                          </button>
                        </>
                      )}
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
