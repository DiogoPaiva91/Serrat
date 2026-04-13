import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { StatusDot } from "@/components/ui/status-dot";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/data-table";
import { Select } from "@/components/ui/select-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatsCard } from "@/components/shared/StatsCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Plus,
  Download,
  Heart,
  Star,
  Trash2,
  Palette,
  Type,
  Layers,
  LayoutGrid,
  Square,
  CircleDot,
  AlertCircle,
  Table2,
  MousePointerClick,
  ToggleRight,
  ClipboardList,
  Users,
  QrCode,
  Building2,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { colors } from "@/lib/design-tokens";

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ColorSwatch({ name, value, className }: { name: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("w-16 h-16 rounded-lg border shadow-sm", className)} style={!className ? { backgroundColor: value } : undefined} />
      <span className="text-xs font-medium text-foreground">{name}</span>
      <span className="text-[10px] text-muted-foreground font-mono">{value}</span>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "cores", label: "Cores", icon: Palette },
  { id: "tipografia", label: "Tipografia", icon: Type },
  { id: "botoes", label: "Botoes", icon: MousePointerClick },
  { id: "inputs", label: "Inputs", icon: Square },
  { id: "cards", label: "Cards", icon: Layers },
  { id: "badges", label: "Badges", icon: CircleDot },
  { id: "alertas", label: "Alertas", icon: AlertCircle },
  { id: "dialogs", label: "Dialogs", icon: LayoutGrid },
  { id: "tabela", label: "Tabela", icon: Table2 },
  { id: "feedback", label: "Feedback", icon: ToggleRight },
  { id: "compostos", label: "Compostos", icon: Layers },
];

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState("cores");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl ds-gradient-primary flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Tecnopano Design System</h1>
                  <p className="text-xs text-muted-foreground">Componentes, tokens e padroes visuais</p>
                </div>
              </div>
              <Badge variant="outline" size="lg">v1.0</Badge>
            </div>
          </div>
          {/* Navigation */}
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto">
            <div className="flex gap-1 pb-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">

          {/* ─── CORES ─────────────────────────────────────────────── */}
          <Section id="cores" title="Paleta de Cores" description="Cores do Design System Tecnopano. A cor primaria amber/golden e usada como acento principal.">
            <Card>
              <CardHeader>
                <CardTitle>Primary — Amber/Golden</CardTitle>
                <CardDescription>A cor de identidade do Tecnopano, usada em botoes, links e destaques</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(colors.primary).filter(([k]) => k !== "DEFAULT").map(([name, value]) => (
                    <ColorSwatch key={name} name={name} value={value as string} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Neutros</CardTitle>
                <CardDescription>Usadas para textos, fundos e bordas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(colors.neutral).map(([name, value]) => (
                    <ColorSwatch key={name} name={name} value={value} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(["success", "warning", "error", "info"] as const).map((key) => (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className={cn("w-full h-12 rounded-lg mb-3", colors.semantic[key].bg)} />
                    <p className="text-sm font-semibold capitalize">{key}</p>
                    <p className="text-xs text-muted-foreground font-mono">{colors.semantic[key].hex}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Semanticas (CSS Variables)</CardTitle>
                <CardDescription>Tokens de cor adaptaveis ao tema light/dark</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { name: "background", cls: "bg-background border" },
                    { name: "foreground", cls: "bg-foreground" },
                    { name: "primary", cls: "bg-primary" },
                    { name: "secondary", cls: "bg-secondary border" },
                    { name: "muted", cls: "bg-muted" },
                    { name: "accent", cls: "bg-accent border" },
                    { name: "destructive", cls: "bg-destructive" },
                    { name: "card", cls: "bg-card border" },
                    { name: "popover", cls: "bg-popover border" },
                    { name: "border", cls: "bg-border" },
                    { name: "input", cls: "bg-input" },
                    { name: "ring", cls: "bg-ring" },
                  ].map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-1.5">
                      <div className={cn("w-full h-12 rounded-lg", c.cls)} />
                      <span className="text-xs font-medium">{c.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Graficos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(colors.chart).map(([name, value]) => (
                    <ColorSwatch key={name} name={name} value={value} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ─── TIPOGRAFIA ────────────────────────────────────────── */}
          <Section id="tipografia" title="Tipografia" description="Inter como fonte principal, com escala tipografica definida.">
            <Card>
              <CardHeader>
                <CardTitle>Escala Tipografica</CardTitle>
                <CardDescription>Font: Inter, weights 300-800</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">4xl</span>
                    <span className="text-4xl font-bold">Tecnopano</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">3xl</span>
                    <span className="text-3xl font-bold">Tecnopano</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">2xl</span>
                    <span className="text-2xl font-bold">Tecnopano</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">xl</span>
                    <span className="text-xl font-semibold">Titulo de Pagina</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">lg</span>
                    <span className="text-lg font-semibold">Titulo de Card</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">base</span>
                    <span className="text-base">Corpo de texto padrao</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-2">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">sm</span>
                    <span className="text-sm">Texto secundario e labels</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs text-muted-foreground w-16 shrink-0 font-mono">xs</span>
                    <span className="text-xs">Captions e textos auxiliares</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pesos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { w: "font-light", label: "Light (300)" },
                    { w: "font-normal", label: "Regular (400)" },
                    { w: "font-medium", label: "Medium (500)" },
                    { w: "font-semibold", label: "Semibold (600)" },
                    { w: "font-bold", label: "Bold (700)" },
                    { w: "font-extrabold", label: "Extrabold (800)" },
                  ].map((f) => (
                    <div key={f.w} className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground w-28 shrink-0 font-mono">{f.label}</span>
                      <span className={cn("text-base", f.w)}>Design System Tecnopano</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Padroes de Uso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div><span className="text-xs font-mono text-muted-foreground">pageTitle: </span><span className="text-xl font-semibold text-foreground">Titulo de Pagina</span></div>
                <div><span className="text-xs font-mono text-muted-foreground">cardTitle: </span><span className="text-lg font-semibold leading-none tracking-tight">Titulo de Card</span></div>
                <div><span className="text-xs font-mono text-muted-foreground">label: </span><span className="text-sm font-medium">Label de Formulario</span></div>
                <div><span className="text-xs font-mono text-muted-foreground">body: </span><span className="text-sm text-foreground">Texto de corpo padrao do sistema</span></div>
                <div><span className="text-xs font-mono text-muted-foreground">bodyMuted: </span><span className="text-sm text-muted-foreground">Texto secundario ou descritivo</span></div>
                <div><span className="text-xs font-mono text-muted-foreground">caption: </span><span className="text-xs text-muted-foreground">Caption ou texto auxiliar</span></div>
                <div><span className="text-xs font-mono text-muted-foreground">statValue: </span><span className="text-2xl font-bold">1.234</span></div>
              </CardContent>
            </Card>
          </Section>

          {/* ─── BOTOES ────────────────────────────────────────────── */}
          <Section id="botoes" title="Botoes" description="Variantes de botao para diferentes contextos e niveis de enfase.">
            <Card>
              <CardHeader>
                <CardTitle>Variantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="outline-primary">Outline Primary</Button>
                </div>

                <Separator label="Tamanhos" />

                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs">Extra Small</Button>
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>

                <Separator label="Com Icone" />

                <div className="flex flex-wrap gap-3">
                  <Button><Plus className="h-4 w-4" /> Novo Item</Button>
                  <Button variant="outline"><Download className="h-4 w-4" /> Exportar</Button>
                  <Button variant="destructive"><Trash2 className="h-4 w-4" /> Excluir</Button>
                  <Button variant="success"><Heart className="h-4 w-4" /> Salvar</Button>
                </div>

                <Separator label="Icone Only" />

                <div className="flex flex-wrap items-center gap-3">
                  <Button size="icon-sm" variant="ghost"><Star className="h-4 w-4" /></Button>
                  <Button size="icon" variant="outline"><Search className="h-4 w-4" /></Button>
                  <Button size="icon-lg" variant="secondary"><Plus className="h-5 w-5" /></Button>
                </div>

                <Separator label="Estados" />

                <div className="flex flex-wrap gap-3">
                  <Button disabled>Desabilitado</Button>
                  <Button className="btn-shimmer border-none">Shimmer</Button>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ─── INPUTS ────────────────────────────────────────────── */}
          <Section id="inputs" title="Inputs & Formularios" description="Componentes de entrada de dados.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Text Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-input">Label padrao</Label>
                    <Input id="default-input" placeholder="Digite algo..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-input">Com icone</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="search-input" placeholder="Buscar..." className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disabled-input">Desabilitado</Label>
                    <Input id="disabled-input" placeholder="Nao editavel" disabled />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outros Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="textarea">Textarea</Label>
                    <Textarea id="textarea" placeholder="Descricao detalhada..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="select">Select</Label>
                    <Select id="select">
                      <option value="">Selecione uma opcao</option>
                      <option value="1">Opcao 1</option>
                      <option value="2">Opcao 2</option>
                      <option value="3">Opcao 3</option>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="switch-demo" />
                    <Label htmlFor="switch-demo">Ativar notificacoes</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ─── CARDS ─────────────────────────────────────────────── */}
          <Section id="cards" title="Cards" description="Containers de conteudo com diferentes niveis de complexidade.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Simples</CardTitle>
                  <CardDescription>Descricao do card com texto auxiliar</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Conteudo do card com informacoes relevantes.</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>Card com Hover</CardTitle>
                  <CardDescription>Passe o mouse para ver o efeito</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card interativo com elevacao no hover.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver mais <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-primary/30 bg-primary/5">
                <CardHeader>
                  <CardTitle>Card Destaque</CardTitle>
                  <CardDescription>Com borda e fundo primary</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Card com destaque usando a cor primaria.</p>
                </CardContent>
              </Card>
            </div>

            <Separator label="Stats Cards" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Ordens de Servico" value={128} change="+12.5%" changeType="positive" icon={ClipboardList} iconBg="bg-blue-100" iconColor="text-blue-600" index={0} />
              <StatsCard title="QR Codes" value={542} change="+8.2%" changeType="positive" icon={QrCode} iconBg="bg-amber-100" iconColor="text-amber-600" index={1} />
              <StatsCard title="Funcionarios" value={24} change="-2.1%" changeType="negative" icon={Users} iconBg="bg-green-100" iconColor="text-green-600" index={2} />
              <StatsCard title="Empresas" value={8} icon={Building2} iconBg="bg-purple-100" iconColor="text-purple-600" index={3} />
            </div>
          </Section>

          {/* ─── BADGES ────────────────────────────────────────────── */}
          <Section id="badges" title="Badges" description="Indicadores visuais inline para status e categorias.">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Variantes</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="error">Error</Badge>
                    <Badge variant="purple">Purple</Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Tamanhos</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge size="sm">Small</Badge>
                    <Badge size="default">Default</Badge>
                    <Badge size="lg">Large</Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Status Dots</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <StatusDot status="online" label="Ativo" />
                    <StatusDot status="offline" label="Inativo" />
                    <StatusDot status="busy" label="Ocupado" />
                    <StatusDot status="away" label="Ausente" />
                    <StatusDot status="pending" label="Pendente" pulse />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ─── ALERTAS ───────────────────────────────────────────── */}
          <Section id="alertas" title="Alertas" description="Mensagens de feedback contextuais.">
            <div className="space-y-3">
              <Alert variant="info" title="Informacao">
                Esta e uma mensagem informativa para o usuario.
              </Alert>
              <Alert variant="success" title="Sucesso!">
                Operacao realizada com sucesso.
              </Alert>
              <Alert variant="warning" title="Atencao">
                Verifique os dados antes de prosseguir.
              </Alert>
              <Alert variant="error" title="Erro" dismissible onDismiss={() => {}}>
                Ocorreu um erro ao processar a solicitacao.
              </Alert>
              <Alert variant="default" title="Padrao">
                Alerta com estilo neutro padrao.
              </Alert>
            </div>
          </Section>

          {/* ─── DIALOGS ───────────────────────────────────────────── */}
          <Section id="dialogs" title="Dialogs & Modais" description="Sobreposicoes para acoes e formularios.">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Dialog Padrao</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Titulo do Dialog</DialogTitle>
                        <DialogDescription>Descricao explicando o contexto desta acao.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input placeholder="Digite o nome..." />
                        </div>
                        <div className="space-y-2">
                          <Label>Descricao</Label>
                          <Textarea placeholder="Descricao..." />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancelar</Button>
                        <Button>Salvar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                    Confirm Dialog
                  </Button>
                  <ConfirmDialog
                    open={confirmOpen}
                    onOpenChange={setConfirmOpen}
                    title="Confirmar exclusao"
                    description="Esta acao nao pode ser desfeita."
                    onConfirm={() => {}}
                    variant="danger"
                  />
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* ─── TABELA ────────────────────────────────────────────── */}
          <Section id="tabela" title="Tabela" description="Componente de tabela estilizado para exibicao de dados.">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Funcao</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { name: "Joao Silva", email: "joao@email.com", role: "Operador", status: "online" as const },
                      { name: "Maria Santos", email: "maria@email.com", role: "Admin", status: "away" as const },
                      { name: "Pedro Costa", email: "pedro@email.com", role: "Tecnico", status: "offline" as const },
                      { name: "Ana Oliveira", email: "ana@email.com", role: "Operador", status: "busy" as const },
                    ].map((row) => (
                      <TableRow key={row.email}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar size="sm" alt={row.name} />
                            {row.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.email}</TableCell>
                        <TableCell><Badge variant="secondary">{row.role}</Badge></TableCell>
                        <TableCell><StatusDot status={row.status} label={row.status === "online" ? "Ativo" : row.status === "away" ? "Ausente" : row.status === "busy" ? "Ocupado" : "Inativo"} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Section>

          {/* ─── FEEDBACK & ESTADOS ────────────────────────────────── */}
          <Section id="feedback" title="Feedback & Estados" description="Componentes para loading, estados vazios, tooltips e mais.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spinners</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-6">
                    <Spinner size="sm" />
                    <Spinner />
                    <Spinner size="lg" />
                    <Spinner size="xl" label="Carregando..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skeletons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3">
                    <Avatar size="sm" alt="Ana" />
                    <Avatar alt="Bruno" />
                    <Avatar size="lg" alt="Carlos" />
                    <Avatar size="xl" alt="Diana" />
                    <Avatar src="https://ui-avatars.com/api/?name=TP&background=f59e0b&color=fff" alt="TP" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tooltips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">Hover aqui</Button>
                      </TooltipTrigger>
                      <TooltipContent>Tooltip informativo</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon"><Star className="h-4 w-4" /></Button>
                      </TooltipTrigger>
                      <TooltipContent>Favoritar</TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    title="Nenhum resultado encontrado"
                    description="Tente ajustar os filtros ou criar um novo item."
                    action={{ label: "Criar Novo", onClick: () => {} }}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tabs</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="geral">
                  <TabsList>
                    <TabsTrigger value="geral">Geral</TabsTrigger>
                    <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                    <TabsTrigger value="historico">Historico</TabsTrigger>
                  </TabsList>
                  <TabsContent value="geral">
                    <p className="text-sm text-muted-foreground p-4">Conteudo da aba geral.</p>
                  </TabsContent>
                  <TabsContent value="detalhes">
                    <p className="text-sm text-muted-foreground p-4">Conteudo da aba detalhes.</p>
                  </TabsContent>
                  <TabsContent value="historico">
                    <p className="text-sm text-muted-foreground p-4">Conteudo da aba historico.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Separator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Conteudo acima</p>
                <Separator />
                <p className="text-sm text-muted-foreground">Conteudo abaixo</p>
                <Separator label="ou" />
                <p className="text-sm text-muted-foreground">Com label</p>
              </CardContent>
            </Card>
          </Section>

          {/* ─── COMPOSTOS ─────────────────────────────────────────── */}
          <Section id="compostos" title="Componentes Compostos" description="Componentes de layout e composicao.">
            <Card>
              <CardHeader>
                <CardTitle>Page Header</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <PageHeader title="Ordens de Servico" description="Gerencie todas as ordens do sistema.">
                    <Button variant="outline"><Download className="h-4 w-4" /> Exportar</Button>
                    <Button><Plus className="h-4 w-4" /> Nova Ordem</Button>
                  </PageHeader>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Espacamento & Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm font-medium">Escala de espacamento (4px base)</p>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-8 font-mono">{s}</span>
                      <div className="h-4 bg-primary/20 border border-primary/30 rounded-sm" style={{ width: `${s * 4}px` }} />
                      <span className="text-xs text-muted-foreground font-mono">{s * 4}px</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "none", cls: "rounded-none" },
                    { label: "sm", cls: "rounded-sm" },
                    { label: "md", cls: "rounded-md" },
                    { label: "lg", cls: "rounded-lg" },
                    { label: "xl", cls: "rounded-xl" },
                    { label: "2xl", cls: "rounded-2xl" },
                    { label: "full", cls: "rounded-full" },
                  ].map((r) => (
                    <div key={r.label} className="flex flex-col items-center gap-1.5">
                      <div className={cn("w-16 h-16 bg-primary/20 border-2 border-primary/40", r.cls)} />
                      <span className="text-xs font-mono text-muted-foreground">{r.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sombras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {[
                    { label: "none", cls: "shadow-none" },
                    { label: "sm", cls: "shadow-sm" },
                    { label: "default", cls: "shadow" },
                    { label: "md", cls: "shadow-md" },
                    { label: "lg", cls: "shadow-lg" },
                    { label: "xl", cls: "shadow-xl" },
                  ].map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-1.5">
                      <div className={cn("w-20 h-20 rounded-lg bg-card border", s.cls)} />
                      <span className="text-xs font-mono text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Section>

          {/* Footer */}
          <Separator />
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Tecnopano Design System v1.0 — Construido com Tailwind CSS, Radix UI e React
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
