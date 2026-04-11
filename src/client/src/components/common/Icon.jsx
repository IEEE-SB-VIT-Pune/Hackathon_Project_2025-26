import {
  Rocket,
  Trophy,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Heart,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Download,
  Share2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Home,
  BarChart3,
  Code,
  Zap,
  Target,
  GitBranch,
  Lock,
  Unlock,
  Filter,
  Clock,
  Briefcase,
  Award,
  Bookmark,
  MessageSquare,
  Send,
  Loader,
  Bell,
} from "lucide-react";

// Icon mapping from emoji to lucide icon
const ICON_MAP = {
  // Rocket emoji → Rocket icon
  "🚀": Rocket,
  // Trophy emoji → Trophy icon
  "🏆": Trophy,
  // Checkmark emoji → CheckCircle icon
  "✅": CheckCircle,
  "❌": AlertCircle,
  // Lightbulb emoji → Lightbulb icon
  "💡": Lightbulb,
  // Heart emoji → Heart icon
  "❤️": Heart,
  // Note emoji → FileText icon
  "📝": FileText,
  // Team emoji → Users icon
  "👥": Users,
  // Calendar emoji → Calendar icon
  "📅": Calendar,
  // Settings emoji → Settings icon
  "⚙️": Settings,
  // Search emoji → Search icon
  "🔍": Search,
  // Plus emoji → Plus icon
  "➕": Plus,
  // Gear emoji → Settings icon
  "🔧": Settings,
  // Target emoji → Target icon
  "🎯": Target,
  // Lightning → Zap icon
  "⚡": Zap,
};

/**
 * Generic Icon Component
 * Usage: <Icon name="rocket" size={24} className="text-primary-dark" />
 * or: <Icon emoji="🚀" size={24} />
 */
export const Icon = ({
  name,
  emoji,
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}) => {
  let IconComponent = null;

  // If emoji provided, use the mapping
  if (emoji && ICON_MAP[emoji]) {
    IconComponent = ICON_MAP[emoji];
  } else if (name) {
    // Map common icon names to lucide components
    const iconMap = {
      rocket: Rocket,
      trophy: Trophy,
      check: CheckCircle,
      error: AlertCircle,
      lightbulb: Lightbulb,
      heart: Heart,
      users: Users,
      calendar: Calendar,
      file: FileText,
      settings: Settings,
      logout: LogOut,
      menu: Menu,
      close: X,
      search: Search,
      plus: Plus,
      edit: Edit,
      delete: Trash2,
      eye: Eye,
      eyeOff: EyeOff,
      upload: Upload,
      download: Download,
      share: Share2,
      mail: Mail,
      phone: Phone,
      location: MapPin,
      external: ExternalLink,
      chevronRight: ChevronRight,
      chevronLeft: ChevronLeft,
      chevronDown: ChevronDown,
      chevronUp: ChevronUp,
      arrowRight: ArrowRight,
      arrowLeft: ArrowLeft,
      home: Home,
      chart: BarChart3,
      code: Code,
      zap: Zap,
      target: Target,
      git: GitBranch,
      lock: Lock,
      unlock: Unlock,
      filter: Filter,
      clock: Clock,
      briefcase: Briefcase,
      award: Award,
      bookmark: Bookmark,
      message: MessageSquare,
      send: Send,
      loader: Loader,
      bell: Bell,
    };
    IconComponent = iconMap[name.toLowerCase()];
  }

  if (!IconComponent) {
    console.warn(`Icon not found: ${name || emoji}`);
    return null;
  }

  return (
    <IconComponent size={size} className={className} color={color} {...props} />
  );
};

export default Icon;
