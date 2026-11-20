const pool = require('../db/pool');
const staticData = require('../data/landingData');

function getCollegeInfo() {
  return staticData.college;
}

function getModules() {
  return staticData.modules;
}

function getFeaturedContent() {
  return staticData.featured;
}

function mapAnnouncement(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    summary: row.summary,
    content: row.content,
    image: row.image_url,
    date: row.published_at ? new Date(row.published_at).toISOString().slice(0, 10) : null,
    featured: false,
    status: row.is_published ? 'Published' : 'Draft',
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAnnouncements(query = {}) {
  const params = [];
  const conditions = ['is_published = TRUE'];

  if (query.category && query.category.toLowerCase() !== 'all') {
    params.push(query.category);
    conditions.push(`LOWER(category) = LOWER($${params.length})`);
  }

  if (query.search) {
    params.push(`%${query.search}%`);
    conditions.push(`(title ILIKE $${params.length} OR summary ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT * FROM announcements ${where} ORDER BY published_at DESC`,
    params
  );

  const items = result.rows.map(mapAnnouncement);
  return { data: items, total: items.length };
}

async function getAnnouncementById(id) {
  const result = await pool.query(
    'SELECT * FROM announcements WHERE id = $1 AND is_published = TRUE',
    [id]
  );
  if (!result.rowCount) return null;
  return mapAnnouncement(result.rows[0]);
}

async function createAnnouncement({ title, category, summary, content, imageUrl, userId }) {
  const result = await pool.query(
    `INSERT INTO announcements (title, category, summary, content, image_url, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [title.trim(), category || 'General', summary.trim(), content.trim(), imageUrl || null, userId || null]
  );
  return mapAnnouncement(result.rows[0]);
}

async function updateAnnouncement(id, fields) {
  const allowed = {
    title: 'title',
    category: 'category',
    summary: 'summary',
    content: 'content',
    imageUrl: 'image_url',
    isPublished: 'is_published',
  };
  const sets = [];
  const params = [];
  for (const [key, col] of Object.entries(allowed)) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${col} = $${params.length}`);
    }
  }
  if (!sets.length) return null;
  params.push(id);
  const result = await pool.query(
    `UPDATE announcements SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!result.rowCount) return null;
  return mapAnnouncement(result.rows[0]);
}

async function deleteAnnouncement(id) {
  const result = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

module.exports = {
  getCollegeInfo,
  getModules,
  getFeaturedContent,
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
