import Dialog from "../../ui/Dialog";
import PillButton from "../../ui/PillButton";
import DialogPanel from "../DialogPanel";
import { useQrScanner } from "./hooks/useQrScanner";
import "./ScanOverlay.css";

/* A camera inside the app, for what a phone's own camera app can't serve: a laptop reading a phone's screen, and an iOS home-screen install with its own storage. */
export default function ScanOverlay({ onClose }: { onClose: () => void }) {
  const { video, note, broken } = useQrScanner(onClose);
  return (
    <Dialog className="scanwrap" label="Scan a linking code">
      <DialogPanel className="scancard" title="Scan a linking code" actions={<PillButton onClick={onClose}>Cancel</PillButton>}>
        {!broken && <video ref={video} className="scanvid" playsInline muted autoPlay />}
        <p className="scannote" role="status">
          {note}
        </p>
      </DialogPanel>
    </Dialog>
  );
}
