import { useMutation } from "@tanstack/react-query";
import { Review, InstagramPost } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Função para obter as mutações de reviews com callbacks personalizados
export function useReviewMutations(
  setIsReviewDialogOpen: (open: boolean) => void,
  setSelectedReview: any, // Usando any para contornar problemas de tipagem
  setIsDeleteReviewDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();
  
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: Omit<Review, 'id'>) => {
      return await apiRequest('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Avaliação adicionada",
        description: "A nova avaliação foi adicionada com sucesso."
      });
      setIsReviewDialogOpen(false);
      setSelectedReview(null);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar avaliação",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const updateReviewMutation = useMutation({
    mutationFn: async (updatedReview: Review) => {
      return await apiRequest(`/api/reviews/${updatedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReview),
      });
    },
    onSuccess: () => {
      toast({
        title: "Avaliação atualizada",
        description: "A avaliação foi atualizada com sucesso."
      });
      setIsReviewDialogOpen(false);
      setSelectedReview(null);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar avaliação",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Avaliação excluída",
        description: "A avaliação foi excluída com sucesso."
      });
      setIsDeleteReviewDialogOpen(false);
      setSelectedReview(null);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir avaliação",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return { createReviewMutation, updateReviewMutation, deleteReviewMutation };
}

// Função para obter as mutações de posts do Instagram com callbacks personalizados
export function useInstagramPostMutations(
  setIsInstagramPostDialogOpen: (open: boolean) => void,
  setSelectedInstagramPost: any, // Usando any para contornar problemas de tipagem
  setIsDeleteInstagramPostDialogOpen: (open: boolean) => void
) {
  const { toast } = useToast();
  
  const createInstagramPostMutation = useMutation({
    mutationFn: async (postData: Omit<InstagramPost, 'id'>) => {
      return await apiRequest('/api/instagram-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Post adicionado",
        description: "O novo post do Instagram foi adicionado com sucesso."
      });
      setIsInstagramPostDialogOpen(false);
      setSelectedInstagramPost(null);
      queryClient.invalidateQueries({ queryKey: ['/api/instagram-posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar post",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const updateInstagramPostMutation = useMutation({
    mutationFn: async (updatedPost: InstagramPost) => {
      return await apiRequest(`/api/instagram-posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      });
    },
    onSuccess: () => {
      toast({
        title: "Post atualizado",
        description: "O post do Instagram foi atualizado com sucesso."
      });
      setIsInstagramPostDialogOpen(false);
      setSelectedInstagramPost(null);
      queryClient.invalidateQueries({ queryKey: ['/api/instagram-posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar post",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const deleteInstagramPostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/instagram-posts/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Post excluído",
        description: "O post do Instagram foi excluído com sucesso."
      });
      setIsDeleteInstagramPostDialogOpen(false);
      setSelectedInstagramPost(null);
      queryClient.invalidateQueries({ queryKey: ['/api/instagram-posts'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir post",
        description: `Ocorreu um erro: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return { createInstagramPostMutation, updateInstagramPostMutation, deleteInstagramPostMutation };
}