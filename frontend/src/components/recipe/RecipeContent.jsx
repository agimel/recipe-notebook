import React from 'react';
import RecipeHeader from './RecipeHeader';
import IngredientsSection from './IngredientsSection';
import StepsSection from './StepsSection';
import ActionButtons from './ActionButtons';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import WelcomeBanner from './WelcomeBanner';
import './RecipeContent.css';

function RecipeContent({ 
  recipe, 
  onEdit, 
  onDelete, 
  deleteDialogOpen, 
  isDeleting,
  onDeleteConfirm,
  onDeleteCancel,
  titleRef
}) {
  const isSampleRecipe = recipe.id === 1;

  return (
    <div className="recipe-content">
      {isSampleRecipe && <WelcomeBanner recipeId={recipe.id} />}
      
      <RecipeHeader
        title={recipe.title}
        difficulty={recipe.difficulty}
        cookingTimeMinutes={recipe.cookingTimeMinutes}
        categories={recipe.categories}
        titleRef={titleRef}
      />
      
      <IngredientsSection ingredients={recipe.ingredients} />
      
      <StepsSection steps={recipe.steps} />
      
      <ActionButtons
        onEdit={onEdit}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />
      
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        recipeTitle={recipe.title}
        isDeleting={isDeleting}
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />
    </div>
  );
}

export default RecipeContent;
