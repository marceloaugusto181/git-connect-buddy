import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText, FileVideo, FileAudio, HardDrive, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useResources, ResourceInsert } from '@/hooks/useResources';

interface ResourceFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResourceFormModal: React.FC<ResourceFormModalProps> = ({ open, onOpenChange }) => {
  const { createResource, uploadFile } = useResources();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ResourceInsert>({
    title: '',
    type: 'PDF',
    category: 'Exercício',
    auto_send: false,
    trigger_event: null,
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [cloudUrl, setCloudUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: selectedFile.name.split('.')[0] }));
      }
      
      // Auto-detect type based on file extension
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') {
        setFormData(prev => ({ ...prev, type: 'PDF' }));
      } else if (['mp4', 'mov', 'avi', 'webm'].includes(ext || '')) {
        setFormData(prev => ({ ...prev, type: 'Vídeo' }));
      } else if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) {
        setFormData(prev => ({ ...prev, type: 'Áudio' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsUploading(true);
      
      let fileUrl: string | null = null;
      let fileSize: string | null = null;
      
      if (file) {
        const uploadResult = await uploadFile(file);
        fileUrl = uploadResult.url;
        fileSize = uploadResult.size;
      }
      
      await createResource.mutateAsync({
        ...formData,
        file_url: fileUrl,
        file_size: fileSize,
        cloud_url: formData.type === 'Drive' || formData.type === 'Link' ? cloudUrl : null,
      });
      
      // Reset form
      setFormData({
        title: '',
        type: 'PDF',
        category: 'Exercício',
        auto_send: false,
        trigger_event: null,
      });
      setFile(null);
      setCloudUrl('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating resource:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'Vídeo': return <FileVideo className="w-4 h-4" />;
      case 'Áudio': return <FileAudio className="w-4 h-4" />;
      case 'Drive': return <HardDrive className="w-4 h-4" />;
      case 'Link': return <LinkIcon className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const showFileUpload = ['PDF', 'Vídeo', 'Áudio'].includes(formData.type);
  const showUrlInput = ['Drive', 'Link'].includes(formData.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Arquivo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Nome do arquivo"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">
                    <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> PDF</span>
                  </SelectItem>
                  <SelectItem value="Vídeo">
                    <span className="flex items-center gap-2"><FileVideo className="w-4 h-4" /> Vídeo</span>
                  </SelectItem>
                  <SelectItem value="Áudio">
                    <span className="flex items-center gap-2"><FileAudio className="w-4 h-4" /> Áudio</span>
                  </SelectItem>
                  <SelectItem value="Drive">
                    <span className="flex items-center gap-2"><HardDrive className="w-4 h-4" /> Drive</span>
                  </SelectItem>
                  <SelectItem value="Link">
                    <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Link</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Exercício">Exercício</SelectItem>
                  <SelectItem value="Educativo">Educativo</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {showFileUpload && (
            <div className="space-y-2">
              <Label>Arquivo</Label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept={
                  formData.type === 'PDF' ? '.pdf' :
                  formData.type === 'Vídeo' ? 'video/*' :
                  formData.type === 'Áudio' ? 'audio/*' : '*'
                }
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    {getTypeIcon(formData.type)}
                    <span className="font-medium text-sm">{file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Clique para selecionar</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {showUrlInput && (
            <div className="space-y-2">
              <Label htmlFor="cloudUrl">URL</Label>
              <Input
                id="cloudUrl"
                value={cloudUrl}
                onChange={(e) => setCloudUrl(e.target.value)}
                placeholder={formData.type === 'Drive' ? 'Link do Google Drive' : 'URL do recurso'}
                required
              />
            </div>
          )}
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="font-medium text-sm">Envio Automático</p>
              <p className="text-xs text-muted-foreground">Enviar automaticamente para pacientes</p>
            </div>
            <Switch
              checked={formData.auto_send}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_send: checked }))}
            />
          </div>
          
          {formData.auto_send && (
            <div className="space-y-2">
              <Label>Gatilho</Label>
              <Select
                value={formData.trigger_event || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_event: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Quando enviar?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No Cadastro">No Cadastro</SelectItem>
                  <SelectItem value="Pós 1ª Sessão">Pós 1ª Sessão</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isUploading || createResource.isPending || (!file && showFileUpload) || (!cloudUrl && showUrlInput)}
            >
              {isUploading || createResource.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceFormModal;
