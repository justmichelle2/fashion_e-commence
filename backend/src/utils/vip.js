const VIP_EXPERIENCES = [
  {
    id: 'atelier-video',
    title: 'Atelier Video Session',
    tagline: 'Meet the couturier face-to-face in HD',
    channel: 'video',
    durationMinutes: 30,
    perks: ['Live fabric review', 'Instant sketch revisions', 'Invite-only calendar slots'],
    description: 'A white-glove video room hosted by senior stylists where clients co-create silhouettes in real time.',
  },
  {
    id: 'concierge-chat',
    title: 'Concierge Chat Thread',
    tagline: 'Priority text channel with your design duo',
    channel: 'chat',
    durationMinutes: null,
    perks: ['Real-time sourcing updates', 'Mood board sharing', 'Pinned inspiration'],
    description: 'A persistent chat that keeps sketches, swatches, and approvals in one luxe thread.',
  },
  {
    id: 'atelier-fitting',
    title: 'Virtual Fitting Suite',
    tagline: 'Guided measurements & 3D draping',
    channel: 'video',
    durationMinutes: 45,
    perks: ['2-angle streaming booth', 'Body-map capture', 'Fit notes stored on profile'],
    description: 'Concierge-guided fittings with automatic measurement logging and approved adjustments.',
  },
]

function getVipExperience(id) {
  if (!id) return null
  return VIP_EXPERIENCES.find((experience) => experience.id === id) || null
}

function applyVipExperience(user, experienceId, action = 'grant') {
  if (!user) return []
  const prefs = typeof user.notificationPrefs === 'object' && user.notificationPrefs
    ? { ...user.notificationPrefs }
    : { email: true, sms: false, push: true, vipExperiences: [] }
  const current = Array.isArray(prefs.vipExperiences) ? prefs.vipExperiences : []
  let next = current
  if (action === 'revoke') {
    next = current.filter((entry) => entry !== experienceId)
  } else if (!current.includes(experienceId)) {
    next = [...current, experienceId]
  }
  prefs.vipExperiences = next
  user.notificationPrefs = prefs
  return next
}

module.exports = {
  VIP_EXPERIENCES,
  getVipExperience,
  applyVipExperience,
}
