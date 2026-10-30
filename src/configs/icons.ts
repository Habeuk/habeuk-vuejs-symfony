import type { Component } from 'vue';
import {
  Bell,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  ChartColumn,
  Check,
  ClipboardList,
  Clock,
  Code,
  CreditCard,
  Database,
  Download,
  Euro,
  Eye,
  FileText,
  Filter,
  Folder,
  Globe,
  Heart,
  Home,
  Image,
  Images,
  Info,
  Layers,
  List,
  Lock,
  Mail,
  Map,
  MessageSquare,
  Network,
  Package,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tag,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  X,
} from '@lucide/vue';

/**
 * Correspondance des icônes historiques envoyées par le backend.
 * Le serveur fournit encore des noms de classes PrimeVue (ex. "pi pi-folder") :
 * elles ne sont plus rendues telles quelles (primeicons n'est plus installé) mais
 * servent uniquement de clés de repli vers leur équivalent lucide.
 * Les modèles définis côté frontend portent directement le composant lucide.
 */
const legacyIcons: Record<string, Component> = {
  'pi pi-home': Home,
  'pi pi-user': User,
  'pi pi-users': Users,
  'pi pi-sitemap': Network,
  'pi pi-folder': Folder,
  'pi pi-comments': MessageSquare,
  'pi pi-code': Code,
  'pi pi-android': Bot,
  'pi pi-file': FileText,
  'pi pi-euro': Euro,
  'pi pi-list': List,
  'pi pi-plus': Plus,
  'pi pi-pencil': Pencil,
  'pi pi-trash': Trash2,
  'pi pi-eye': Eye,
  'pi pi-cog': Settings,
  'pi pi-bell': Bell,
  'pi pi-envelope': Mail,
  'pi pi-lock': Lock,
  'pi pi-shield': ShieldCheck,
  'pi pi-database': Database,
  'pi pi-box': Package,
  'pi pi-tag': Tag,
  'pi pi-star': Star,
  'pi pi-image': Image,
  'pi pi-images': Images,
  'pi pi-map': Map,
  'pi pi-shopping-cart': ShoppingCart,
  'pi pi-credit-card': CreditCard,
  'pi pi-truck': Truck,
  'pi pi-building': Building2,
  'pi pi-briefcase': Briefcase,
  'pi pi-clipboard': ClipboardList,
  'pi pi-layers': Layers,
  'pi pi-globe': Globe,
  'pi pi-search': Search,
  'pi pi-filter': Filter,
  'pi pi-download': Download,
  'pi pi-upload': Upload,
  'pi pi-print': Printer,
  'pi pi-refresh': RefreshCw,
  'pi pi-info-circle': Info,
  'pi pi-check': Check,
  'pi pi-times': X,
  'pi pi-calendar': Calendar,
  'pi pi-clock': Clock,
  'pi pi-chart-bar': ChartColumn,
  'pi pi-heart': Heart,
};

/**
 * Icône affichée lorsqu'aucune correspondance n'est trouvée.
 */
export const defaultMenuIcon: Component = Folder;

/**
 * Résout l'icône d'un élément de menu.
 * @param icon Composant lucide (modèle défini côté frontend) ou chaîne héritée du backend.
 */
export const resolveMenuIcon = (icon?: string | Component): Component => {
  if (!icon) return defaultMenuIcon;
  if (typeof icon !== 'string') return icon;
  return legacyIcons[icon] ?? defaultMenuIcon;
};
