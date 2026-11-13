import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from './icons.tsx'

const socials = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'X', Icon: XIcon },
  { label: 'YouTube', Icon: YoutubeIcon },
  { label: 'Instagram', Icon: InstagramIcon },
]

const year = new Date().getFullYear()

const links = ['Acerca de', 'Ayuda', 'Términos', 'Privacidad', 'Contacto']

function Footer() {
  return (
    <footer className="mx-auto w-full max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
      <div className="flex justify-end gap-4 pb-6">
        {socials.map(({ label, Icon }) => (
          <a
            key={label}
            href="#"
            aria-label={label}
            className="text-zinc-400 transition hover:text-white"
          >
            <Icon />
          </a>
        ))}
      </div>
      <div className="flex flex-col gap-4 border-t border-zinc-800 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <li key={link}>
              <a href="#" className="hover:text-white">
                {link}
              </a>
            </li>
          ))}
        </ul>
        <p>© {year} StreamPulse Inc.</p>
      </div>
    </footer>
  )
}

export default Footer
