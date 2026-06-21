import { WEBSITE_EVENTS } from '../../src/utils/gtmEvents'

describe('WEBSITE_EVENTS contract', () => {
  it('matches the canonical event-name map exactly (no rename/add/remove)', () => {
    expect(WEBSITE_EVENTS).toEqual({
      PAGE_VIEW: 'page_view',
      CTA_CLICK: 'cta_click',
      NAV_CLICK: 'nav_click',
      FOOTER_LINK_CLICK: 'footer_link_click',
      MOBILE_MENU_OPEN: 'mobile_menu_open',
      MOBILE_MENU_CLOSE: 'mobile_menu_close',
      MOBILE_MENU_NAV_CLICK: 'mobile_menu_nav_click',
      FEATURE_PAGE_VIEW: 'feature_page_view',
      CONTACT_FORM_SUBMIT: 'contact_form_submit',
      CONTACT_FORM_SUCCESS: 'contact_form_success',
      CONTACT_FORM_ERROR: 'contact_form_error',
      SCROLL_DEPTH: 'scroll_depth',
      VIDEO_PLAY: 'video_play',
      VIDEO_PAUSE: 'video_pause',
      VIDEO_COMPLETE: 'video_complete',
      EXTERNAL_LINK_CLICK: 'external_link_click',
      SOCIAL_LINK_CLICK: 'social_link_click',
    })
  })

  it('has no two keys mapping to the same event name', () => {
    const values = Object.values(WEBSITE_EVENTS)
    expect(new Set(values).size).toBe(values.length)
  })

  it('uses snake_case for every event name (GA4/GTM contract)', () => {
    const snakeCase = /^[a-z][a-z0-9_]*$/
    Object.values(WEBSITE_EVENTS).forEach(name => {
      expect(name).toMatch(snakeCase)
    })
  })
})
