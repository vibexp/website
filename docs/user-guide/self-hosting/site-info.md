# Site Info (Branding)

**Site info** is your company's branding for a self-hosted VibeXP: a name, a
contact address, a few links and a logo. The app shows them in the sidebar, on
the sign-in page, on the public invitation, consent and shared-prompt pages, and
in the emails the instance sends.

Since v0.15.0 these values are stored in the database and edited in the admin
area, under **Settings** → **Site info**. They are not in `config.yaml`, and no
environment variable sets them.

Upgrading from an earlier release that was branded with `VITE_*` variables or
`frontend.*` keys? Read
[Upgrading](upgrading.md#company-branding-moved-to-site-info-v0150) first:
those are ignored now and **nothing is imported**.

## Who can open it

Only an [instance admin](instance-admin.md). The page lives at
`/admin/settings/site-info`: open the admin area, then **Settings** →
**Site info**. Everyone else, team owners included, is sent back to the app's
home page, and the API behind the page answers 404.

## The fields

Every field is optional. A value is trimmed when it is saved, and a blank one
means "not configured". With nothing configured the instance looks exactly like
a stock VibeXP.

| Card | Field | Rule |
| --- | --- | --- |
| **Company** | **Company name** | At most 120 characters |
| **Company** | **Company email** | One email address with no display name, at most 254 characters |
| **Company** | **Website** | A full `http://` or `https://` URL, at most 2048 characters |
| **Links** | **Support URL** | Same URL rule |
| **Links** | **Terms of service URL** | Same URL rule |
| **Links** | **Privacy policy URL** | Same URL rule |
| **Logo** | **Logo URL** | Same URL rule |
| **Logo** | **Dark-mode logo URL** | Same URL rule |

Press **Save changes** to store them. A save needs no restart: your own page
rebrands at once, everyone else sees the change on their next page load, and
the next email the instance sends uses the new values.

If another admin saved while you were editing, your save is refused and nothing
is overwritten. Reload the page to see the current values, then make your change
again.

## What each value does

| Value | Where it shows | When it is empty |
| --- | --- | --- |
| **Company name** | The sidebar, the browser tab title (`Acme Inc. · VibeXP`), "Sign in to Acme Inc.", the copyright line on the sign-in page and in emails, the logo's alt text, the wording of the invitation, consent and shared-prompt pages, and email subjects and bodies | "VibeXP" is used instead |
| **Company email** | Nowhere by itself. It is the Support link's target when no Support URL is set | No effect beyond the [Support link](#the-support-link) |
| **Website** | On the invitation and consent pages the logo and company name link to it, on a shared-prompt page the header does, and the sign-in footer shows its host name as a link | No link on the invitation and consent pages or in the sign-in footer. A shared-prompt page's header links to vibexp.io |
| **Support URL** | **Support** in the user menu, in the sign-in footer and in the email footer | See [The Support link](#the-support-link) |
| **Terms of service URL** | **Terms** in the user menu, the "By continuing, you agree to our…" line on the sign-in page, and the email footer | The link is left out |
| **Privacy policy URL** | **Privacy** in the user menu, the same sign-in line, and the email footer | The link is left out |
| **Logo URL** | The sidebar, the sign-in page, first-run setup, the invitation, consent and shared-prompt pages, the header of every email, and the link-preview image of a shared prompt | The VibeXP mark is shown |
| **Dark-mode logo URL** | The same pages of the web app, in the dark theme only | The dark theme uses the main logo too |

Two things follow from that table:

- **A name and a logo are replaced, not hidden.** With no company name the
  product's own name is shown; with no logo, its mark. Only links disappear.
- **Links disappear one by one.** The user menu lists whichever of Support,
  Terms and Privacy are set and drops the group when none is. The sign-in page
  names only the documents that are set, and leaves out the whole "By
  continuing, you agree to our…" line when neither the terms nor the privacy
  URL is.

A company logo with no company name stands alone: "VibeXP" is never printed
beside another company's logo. Text that needs a name, such as "Sign in to
VibeXP", still uses the product's.

### The Support link

The Support link points to the first of these that is set:

1. the **Support URL**;
2. the **Company email**, as a `mailto:` link;
3. nothing: with neither set, there is no Support link at all.

The same rule applies in the user menu, in the sign-in footer and in emails.

## Logos

A logo is the **address of an image you host**. VibeXP does not upload, copy or
proxy it.

:::caution[Your logo host sees every request]
Because the image stays on your host, each visitor's browser requests it from
there when a page shows it, and each recipient's email client requests it when
an email is opened. That host sees those requests, with the address and the
client details any image request carries. Host the logo somewhere you are
content to receive them, and that everyone who should see the logo can reach.
:::

How the logo is chosen:

- The **dark theme** uses the dark-mode logo when one is set, and the main logo
  otherwise. The light theme only ever uses the main logo, so an instance with
  just a dark-mode logo shows the VibeXP mark in the light theme.
- A logo that **fails to load** (a wrong address, a host that is down) is
  replaced by the VibeXP mark, not by a broken-image icon.
- **Emails always use the main logo**, never the dark-mode one: a mail client
  cannot switch on theme. With no main logo, emails show VibeXP's own.

The **Logo** card previews both themes side by side from what you are typing,
before you save. The preview loads the image in your own browser as soon as the
field holds a full URL, so the logo host sees those requests as well.

## VibeXP attribution

No setting removes VibeXP's own mark. What site info changes is its wording.

An instance counts as **company-branded** once it has a company name, a logo or
a dark-mode logo. Then:

| Surface | Not branded | Company-branded |
| --- | --- | --- |
| Foot of the sidebar | The VibeXP mark, labelled "VibeXP" | The VibeXP mark, labelled "Powered by VibeXP" |
| Sign-in page | VibeXP's own name and mark | Your name and logo, plus a "Powered by VibeXP" credit |
| First-run setup, invitation, consent and shared-prompt pages | No credit line | A "Powered by VibeXP" credit |
| Emails | "Powered by VibeXP" in the footer | "Powered by VibeXP" in the footer |
| Browser tab title | `VibeXP` | `Acme Inc. · VibeXP`, when a company name is set |

So the words "Powered by VibeXP" appear in the web app only next to company
branding, and on an unbranded instance the product is simply shown as "VibeXP".
Emails are the one place the credit is always present.

## The values are public

The eight values are readable **without signing in**, because the sign-in page
has to show them: they are returned by `GET /api/v1/site-info` and inlined in
the `/config.js` the web app loads. That includes the company email, even though
no page prints it. Never put anything private in a site info field.

## Clear site info

**Clear site info** removes every value at once. The instance goes back to
VibeXP's own branding until you enter the values again. There are no built-in
defaults to fall back to: cleared means not configured.

## Change history

The page ends with a **Change history** card: one entry per change, with who
made it, when, and the before and after value of each field that changed.

## API

The page is a client of the instance admin API, which answers 404 to anyone who
is not an instance admin:

| Method and path | Does |
| --- | --- |
| `GET /api/v1/admin/settings/site-info` | Read the values, their limits and the stored version |
| `PUT /api/v1/admin/settings/site-info` | Save all eight values. Pass `expected_version` to get a 409 instead of overwriting someone else's change |
| `DELETE /api/v1/admin/settings/site-info` | Clear every value |
| `GET /api/v1/admin/settings/site-info/audit` | Page through the change history |

`GET /api/v1/site-info` is the public, unauthenticated read described above. A
value that is not configured is `null` there.

## Related

- [Instance Admin Portal](instance-admin.md): who is an instance admin.
- [Instance Email](instance-email.md): the provider the branded emails are sent
  through.
- [Upgrading](upgrading.md#company-branding-moved-to-site-info-v0150): the
  removed `frontend.*` keys and `VITE_*` variables.
