import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ReportIssue() {
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);
      return;
    }

    setImage(file);
  }

  function getLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(
          position.coords.latitude.toString()
        );

        setLongitude(
          position.coords.longitude.toString()
        );
      },
      () => {
        setError(
          "Unable to get your location. Please allow location access."
        );
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!image) {
      setError("Please select an image.");
      return;
    }

    if (!latitude || !longitude) {
      setError(
        "Please provide your location."
      );
      return;
    }

    const formData = new FormData();

    formData.append("image", image);
    formData.append(
      "description",
      description
    );
    formData.append(
      "latitude",
      latitude
    );
    formData.append(
      "longitude",
      longitude
    );

    setLoading(true);

    try {
      const response = await api.post(
        "/complaints",
        formData
      );

      console.log(
        "Complaint created:",
        response.data
      );

      setSuccess(
        "Complaint submitted successfully!"
      );

      setTimeout(() => {
        navigate("/citizen/complaints");
      }, 1200);
    } catch (error) {
      console.error(
        "Complaint submission error:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Unable to submit complaint. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="form-container">
        <div className="page-header">
          <button
            type="button"
            onClick={() =>
              navigate("/citizen")
            }
          >
            ← Back
          </button>

          <h1>Report an Issue</h1>

          <p>
            Help your community by reporting a
            civic problem.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="complaint-form"
        >
          <div className="form-group">
            <label htmlFor="image">
              Issue Image
            </label>

            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />

            {image && (
              <p>
                Selected: {image.name}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Describe the problem..."
              rows={5}
            />
          </div>

          <div className="location-section">
            <div className="section-header">
              <div>
                <h2>Location</h2>

                <p>
                  Your location helps authorities
                  identify the issue.
                </p>
              </div>

              <button
                type="button"
                onClick={getLocation}
              >
                Use My Location
              </button>
            </div>

            <div className="location-fields">
              <div className="form-group">
                <label htmlFor="latitude">
                  Latitude
                </label>

                <input
                  id="latitude"
                  type="text"
                  value={latitude}
                  onChange={(event) =>
                    setLatitude(
                      event.target.value
                    )
                  }
                  placeholder="28.6139"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">
                  Longitude
                </label>

                <input
                  id="longitude"
                  type="text"
                  value={longitude}
                  onChange={(event) =>
                    setLongitude(
                      event.target.value
                    )
                  }
                  placeholder="77.2090"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}