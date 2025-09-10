'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateUser, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user is connected with Google
  const isGoogleUser = Boolean(user?.googleId || user?.provider === 'google');

  // Update form data when user changes or modal opens
  useEffect(() => {
    if (isOpen && user) {
      // Refresh user data when modal opens to ensure we have the latest data
      refreshUser().then(() => {
        if (user) {
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
          }));
        }
      });
    }
  }, [isOpen, user, refreshUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Don't allow updates for Google users
    if (isGoogleUser) {
      setError("Les mises à jour du profil ne sont pas disponibles pour les comptes connectés à Google");
      setLoading(false);
      return;
    }

    // Validate password if provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await api.users.update(user!.id, updateData);
      
      // Update the user in context
      updateUser({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Echec de la mise a jour du profil');
    } finally {
      setLoading(false);
    }
  };

  // Render read-only view for Google users
  if (isGoogleUser) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Informations du profil</DialogTitle>
            <DialogDescription>
              Vos informations de profil depuis Google. Les mises a jour ne sont pas disponibles pour les comptes connectes a Google.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-muted-foreground">Prenom</Label>
                <Input
                  id="firstName"
                  value={user?.firstName || ''}
                  disabled
                  readOnly
                  className="bg-muted/50 cursor-not-allowed opacity-60 text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-muted-foreground">Nom</Label>
                <Input
                  id="lastName"
                  value={user?.lastName || ''}
                  disabled
                  readOnly
                  className="bg-muted/50 cursor-not-allowed opacity-60 text-muted-foreground"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-muted-foreground">E-mail</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                readOnly
                className="bg-muted/50 cursor-not-allowed opacity-60 text-muted-foreground"
              />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-700 font-medium">
                Connecte avec Google - Profil gere par votre compte Google
              </p>
            </div>
            

            
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-700">
                <strong>Note :</strong> Les informations du profil ne peuvent pas etre modifiees pour les comptes connectes a Google.
                Pour mettre a jour vos informations, veuillez modifier les parametres de votre compte Google.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Fermer
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Render edit form for classic users
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Mettez a jour vos informations de profil. L'e-mail ne peut pas etre modifie.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prenom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              L'e-mail ne peut pas etre modifie
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe (optionnel)</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Laissez vide pour conserver le mot de passe actuel"
            />
          </div>

          {formData.password && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmez le nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-500 bg-green-50 p-2 rounded">
              Profil mis a jour avec succes !
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise a jour...' : 'Mettre a jour le profil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 