import { useEffect } from "react";
import {
  hapticFeedback,
  mainButton,
  miniApp,
  themeParams,
  useLaunchParams,
  useSignal,
} from "@tma.js/sdk-react";

interface Mountable {
  mount: () => void;
  unmount: () => void;
}

function useMount(component: Mountable): void {
  useEffect(() => {
    component.mount();
    return () => component.unmount();
  }, [component]);
}

export default function App() {
  useMount(miniApp);

  useEffect(() => {
    themeParams.mount();
    const unbind = themeParams.bindCssVars();
    return () => {
      unbind();
      themeParams.unmount();
    };
  }, []);

  const launchParams = useLaunchParams();
  const user = launchParams.tgWebAppData?.user;
  const platform = launchParams.tgWebAppPlatform;

  const bgColor = useSignal(themeParams.bgColor);
  const textColor = useSignal(themeParams.textColor);

  useEffect(() => {
    miniApp.ready();
  }, []);

  useEffect(() => {
    mainButton.mount();
    mainButton.setText("Done");
    const off = mainButton.onClick(() => {
      hapticFeedback.notificationOccurred("success");
    });
    mainButton.show();
    return () => {
      off();
      mainButton.hide();
      mainButton.unmount();
    };
  }, []);

  return (
    <div className="app">
      <h1>Telegram Mini App</h1>

      <section className="section">
        <div className="field">
          <span className="label">Name</span>
          <span className="value">
            {user ? `${user.first_name} ${user.last_name ?? ""}`.trim() : "—"}
          </span>
        </div>
        <div className="field">
          <span className="label">Username</span>
          <span className="value">
            {user?.username ? `@${user.username}` : "—"}
          </span>
        </div>
        <div className="field">
          <span className="label">ID</span>
          <span className="value">{user?.id ?? "—"}</span>
        </div>
        <div className="field">
          <span className="label">Platform</span>
          <span className="value">{platform}</span>
        </div>
      </section>

      <section className="section">
        <div className="field">
          <span className="label">Background color</span>
          <span className="value">{bgColor ?? "—"}</span>
        </div>
        <div className="field">
          <span className="label">Text color</span>
          <span className="value">{textColor ?? "—"}</span>
        </div>
      </section>

      <button
        type="button"
        className="btn"
        onClick={() => {
          hapticFeedback.impactOccurred("heavy");
          hapticFeedback.notificationOccurred("success");
        }}
      >
        Haptic feedback
      </button>

      <p className="hint">
        Launch via Telegram (@BotFather → /setmenubutton) for real data. A mock
        environment is used locally.
      </p>
    </div>
  );
}
