const express = require('express');
const landingService = require('../services/landingService');
const integrationService = require('../services/integrationService');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateAnnouncementId(req, res, next) {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Announcement ID must be a valid UUID.' });
  }
  next();
}

function extractToken(req) {
  return (
    req.cookies?.cms_session ||
    (req.headers.authorization || '').replace(/^Bearer\s+/i, '') ||
    undefined
  );
}

router.get('/college', (req, res) => {
  res.json(landingService.getCollegeInfo());
});

router.get('/modules', (req, res) => {
  res.json(landingService.getModules());
});

router.get('/featured', (req, res) => {
  res.json(landingService.getFeaturedContent());
});

router.get('/announcements', async (req, res, next) => {
  try {
    const result = await landingService.getAnnouncements(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/announcements/:id', validateAnnouncementId, async (req, res, next) => {
  try {
    const announcement = await landingService.getAnnouncementById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        type: 'about:blank',
        title: 'Not Found',
        status: 404,
        detail: `Announcement with ID ${req.params.id} was not found.`,
      });
    }
    res.json(announcement);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/announcements',
  requireAuth,
  requireRole('faculty', 'admin'),
  async (req, res, next) => {
    try {
      const { title, category, summary, content, imageUrl } = req.body;
      if (!title?.trim() || !summary?.trim() || !content?.trim()) {
        return res.status(400).json({
          message: 'Title, summary, and content are required.',
        });
      }
      const created = await landingService.createAnnouncement({
        title,
        category,
        summary,
        content,
        imageUrl,
        userId: req.user.sub,
      });
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/announcements/:id',
  validateAnnouncementId,
  requireAuth,
  requireRole('faculty', 'admin'),
  async (req, res, next) => {
    try {
      const updated = await landingService.updateAnnouncement(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: 'Announcement not found.' });
      }
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/announcements/:id',
  validateAnnouncementId,
  requireAuth,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const ok = await landingService.deleteAnnouncement(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Announcement not found.' });
      res.json({ message: 'Announcement deleted.' });
    } catch (e) {
      next(e);
    }
  }
);

// Cross-module: Library (demo endpoint kept for Integrations page)
router.get('/integrations/library', async (req, res, next) => {
  try {
    const result = await integrationService.getLibrarySummary({
      accessToken: extractToken(req),
    });
    if (!result.online) return res.status(503).json(result);
    if (!result.ok) return res.status(result.status || 502).json(result);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Live data for one module (forwards JWT when present so partner can personalize)
router.get('/integrations/modules/:moduleId', async (req, res, next) => {
  try {
    const result = await integrationService.getModuleSummary(req.params.moduleId, {
      accessToken: extractToken(req),
    });
    if (!result.online) return res.status(503).json(result);
    if (!result.ok) return res.status(result.status || 502).json(result);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Batch live data for Modules page when user is logged in
router.get('/integrations/modules', async (req, res, next) => {
  try {
    const ids = (req.query.ids || 'library,registrar,student-portal,finance,faculty,clinic,inventory')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const byId = await integrationService.getManyModuleSummaries(ids, {
      accessToken: extractToken(req),
    });
    res.json({ modules: byId });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
