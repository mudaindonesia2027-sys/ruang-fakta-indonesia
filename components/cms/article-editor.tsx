"use client";

import {
  FormEvent,
  useState,
} from "react";

type ArticleEditorProps = {
  initialData?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    category?: string;
    status?: string;
    coverImage?: string;
    authorName?: string;
  };
};

export default function ArticleEditor(
  props: ArticleEditorProps
) {
  const [title, setTitle] =
    useState(
      props.initialData?.title || ""
    );

  const [slug, setSlug] =
    useState(
      props.initialData?.slug || ""
    );

  const [excerpt, setExcerpt] =
    useState(
      props.initialData?.excerpt || ""
    );

  const [content, setContent] =
    useState(
      props.initialData?.content || ""
    );

  const [category, setCategory] =
    useState(
      props.initialData?.category || ""
    );

  const [status, setStatus] =
    useState(
      props.initialData?.status ||
        "DRAFT"
    );

  const [coverImage, setCoverImage] =
    useState(
      props.initialData?.coverImage || ""
    );

  const [authorName, setAuthorName] =
    useState(
      props.initialData?.authorName ||
        ""
    );

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const isEditing =
        Boolean(props.initialData?.id);

      const response = await fetch(
        isEditing
          ? `/api/articles/${props.initialData?.id}`
          : "/api/articles",
        {
          method: isEditing
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,
            slug,
            excerpt,
            content,
            category,
            status,
            coverImage,
            authorName,
          }),
        }
      );

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.error ||
            "Gagal menyimpan artikel."
        );
      }

      setMessage(
        "Artikel berhasil disimpan."
      );

      if (!isEditing) {
        window.location.href =
          `/admin/editor?id=${result.data.id}`;
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="cms-form"
      onSubmit={handleSubmit}
    >
      <div className="form-grid">
        <div className="form-main">
          <label>
            Judul Artikel

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              required
            />
          </label>

          <label>
            Slug

            <input
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value
                )
              }
              placeholder="opsional"
            />
          </label>

          <label>
            Ringkasan

            <textarea
              value={excerpt}
              onChange={(event) =>
                setExcerpt(
                  event.target.value
                )
              }
              rows={4}
            />
          </label>

          <label>
            Isi Artikel

            <textarea
              value={content}
              onChange={(event) =>
                setContent(
                  event.target.value
                )
              }
              rows={20}
              required
            />
          </label>
        </div>

        <aside className="form-sidebar">
          <label>
            Kategori

            <input
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Status

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
            >
              <option value="DRAFT">
                Draft
              </option>

              <option value="REVIEW">
                Review
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="ARCHIVED">
                Archived
              </option>
            </select>
          </label>

          <label>
            URL Gambar Utama

            <input
              value={coverImage}
              onChange={(event) =>
                setCoverImage(
                  event.target.value
                )
              }
              type="url"
            />
          </label>

          <label>
            Nama Penulis

            <input
              value={authorName}
              onChange={(event) =>
                setAuthorName(
                  event.target.value
                )
              }
            />
          </label>

          <button
            className="button-primary"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : "Simpan Artikel"}
          </button>

          {message && (
            <p className="form-message">
              {message}
            </p>
          )}
        </aside>
      </div>
    </form>
  );
}
