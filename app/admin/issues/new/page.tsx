"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";

export default function NewIssuePage() {
  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    const form =
      new FormData(event.currentTarget);

    const payload = {
      title: form.get("title"),
      slug: form.get("slug"),
      summary: form.get("summary"),
      content: form.get("content"),
      category: form.get("category"),

      status: form.get("status"),
      priority:
        form.get("priority"),

      province:
        form.get("province"),

      regency:
        form.get("regency"),

      district:
        form.get("district"),

      village:
        form.get("village"),

      hamlet:
        form.get("hamlet"),

      address:
        form.get("address"),

      coverImage:
        form.get("coverImage"),

      videoUrl:
        form.get("videoUrl"),

      sourceName:
        form.get("sourceName"),

      sourceUrl:
        form.get("sourceUrl"),

      reporterName:
        form.get("reporterName"),
    };

    try {
      const response =
        await fetch("/api/issues", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        });

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.error ||
            "Gagal membuat isu."
        );
      }

      window.location.href =
        "/admin/issues";
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
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <span className="section-kicker">
            CMS
          </span>

          <h1>
            Tambah Isu Baru
          </h1>

          <p>
            Buat data isu dan tentukan
            lokasi sampai tingkat wilayah.
          </p>
        </div>

        <Link
          href="/admin/issues"
          className="button-secondary"
        >
          Kembali
        </Link>
      </section>

      <form
        className="cms-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <div className="form-main">
            <label>
              Judul Isu

              <input
                name="title"
                required
              />
            </label>

            <label>
              Slug

              <input
                name="slug"
                placeholder="opsional"
              />
            </label>

            <label>
              Ringkasan

              <textarea
                name="summary"
                rows={4}
              />
            </label>

            <label>
              Kronologi / Isi Isu

              <textarea
                name="content"
                rows={16}
                required
              />
            </label>

            <h2>
              Wilayah
            </h2>

            <label>
              Provinsi

              <input
                name="province"
                placeholder="Contoh: Jawa Barat"
              />
            </label>

            <label>
              Kabupaten / Kota

              <input name="regency" />
            </label>

            <label>
              Kecamatan

              <input name="district" />
            </label>

            <label>
              Desa / Kelurahan

              <input name="village" />
            </label>

            <label>
              Dusun

              <input name="hamlet" />
            </label>

            <label>
              Alamat Detail

              <textarea
                name="address"
                rows={3}
              />
            </label>
          </div>

          <aside className="form-sidebar">
            <label>
              Kategori

              <input
                name="category"
                placeholder="Contoh: Lingkungan"
              />
            </label>

            <label>
              Status

              <select
                name="status"
                defaultValue="OPEN"
              >
                <option value="OPEN">
                  Open
                </option>

                <option value="MONITORING">
                  Monitoring
                </option>

                <option value="INVESTIGATING">
                  Investigating
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="CLOSED">
                  Archived
                </option>
              </select>
            </label>

            <label>
              Prioritas

              <select
                name="priority"
                defaultValue="MEDIUM"
              >
                <option value="LOW">
                  Rendah
                </option>

                <option value="MEDIUM">
                  Sedang
                </option>

                <option value="HIGH">
                  Tinggi
                </option>

                <option value="CRITICAL">
                  Kritis
                </option>
              </select>
            </label>

            <label>
              URL Gambar

              <input
                name="coverImage"
                type="url"
              />
            </label>

            <label>
              URL Video

              <input
                name="videoUrl"
                type="url"
              />
            </label>

            <label>
              Nama Sumber

              <input name="sourceName" />
            </label>

            <label>
              URL Sumber

              <input
                name="sourceUrl"
                type="url"
              />
            </label>

            <label>
              Nama Pelapor

              <input name="reporterName" />
            </label>

            <button
              type="submit"
              className="button-primary"
              disabled={saving}
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Isu"}
            </button>

            {message && (
              <p className="form-message">
                {message}
              </p>
            )}
          </aside>
        </div>
      </form>
    </main>
  );
}
