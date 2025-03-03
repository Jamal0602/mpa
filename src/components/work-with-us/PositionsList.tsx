
import { Separator } from "@/components/ui/separator";

export const positions = [
  { value: "document_processor", label: "Document Processor" },
  { value: "graphic_designer", label: "Graphic Designer" },
  { value: "video_editor", label: "Video Editor" },
  { value: "3d_modeler", label: "3D Modeler" },
  { value: "autocad_designer", label: "AutoCAD Designer" },
  { value: "web_designer", label: "Web Designer (HTML & CSS)" },
  { value: "javascript_developer", label: "JavaScript Developer" },
  { value: "backend_developer", label: "Backend Developer" },
  { value: "bot_developer", label: "Bot Developer" },
];

export const PositionsList = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Available Positions</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium">Content & Media Specialists</h3>
          <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
            <li>Document Processor – Handles Word, Excel, and PowerPoint tasks</li>
            <li>Graphic Designer – Edits photos and creates design elements</li>
            <li>Video Editor – Edits short and long-form videos</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-medium">3D & CAD Designers</h3>
          <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
            <li>3D Modeler – Creates 3D objects and circuits</li>
            <li>AutoCAD Designer – Works on 2D and 3D AutoCAD projects</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-medium">Web Development Team</h3>
          <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
            <li>Web Designer (HTML & CSS) – Designs websites with front-end technologies</li>
            <li>JavaScript Developer – Develops website interactivity and widgets</li>
            <li>Backend Developer – Manages website hosting, databases, and automation</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-medium">Automation & Bot Developers</h3>
          <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
            <li>Bot Developer – Builds WhatsApp, Instagram, and Discord bots</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-md">
        <h3 className="text-lg font-medium">Payment Terms</h3>
        <ul className="list-disc list-inside mt-2 ml-4 text-muted-foreground">
          <li>Payment released after completion of 3 projects</li>
          <li>For larger projects, payment after 1 project</li>
          <li>Payment tied to project completion, not monthly</li>
          <li>UPI ID for payments: ja.jamalasraf@fam</li>
        </ul>
      </div>
    </div>
  );
};
