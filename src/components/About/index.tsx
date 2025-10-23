import "./styles.css";

import logo from "#assets/logo.svg";

const appVersion = __APP_VERSION__;

export function About() {
  return (
    <div className="About">
      <div className="logo">
        <img src={logo} width="128" height="128" alt="New Tab Desktop UI" />
        <div className="right">
          <p className="title">New Tab Desktop UI</p>
          <p className="small">Version {appVersion}</p>
          <p>
            Need help? Email{" "}
            <a href="mailto:cenkaymartin@gmail.com">
              cenkaymartin@gmail.com
            </a>
            .
          </p>
          <p>
            Find a bug? Please report it to the{" "}
            <a
              href="https://github.com/cenkaymartin/new-tab-desktop-ui"
              rel="noreferrer"
              target="_blank"
            >
              GitHub repository
            </a>
            .
          </p>
        </div>
      </div>
      <div className="details">
        <p className="copyright">
          <a href="https://github.com/cenkaymartin/new-tab-desktop-ui" rel="noreferrer" target="_blank">
            New Tab Desktop UI
          </a>{" "}
          was created by{" "}
          <a href="https://github.com/cenkaymartin" rel="noreferrer" target="_blank">
            Cenkay Martin
          </a>{" "}
          and originally by{" "}
          <a href="https://lucaseverett.dev/" rel="noreferrer" target="_blank">
            Lucas Everett
          </a>
          .
        </p>
        <p className="copyright">
          Copyright &copy; 2018-{new Date().getFullYear()} Lucas Everett.
          Released under the{" "}
          <a
            href="https://github.com/cenkaymartin/new-tab-desktop-ui/blob/main/LICENSE"
            rel="noreferrer"
            target="_blank"
          >
            MIT License
          </a>
          .
        </p>
      </div>
    </div>
  );
}
