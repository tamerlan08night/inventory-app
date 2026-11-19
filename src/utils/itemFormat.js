const TYPE_LABELS = {
    food: 'Food',
    drink: 'Drink',
    weapon: 'Weapon',
    tool: 'Tool',
    helmet: 'Helmet',
    chest: 'Chest',
    gloves: 'Gloves',
    pants: 'Pants',
    boots: 'Boots',
    backpack: 'Backpack',
    module: 'Module',
    special: 'Special',
};

export function getItemTooltip(item) {
    if (!item) return '';

    const parts = [TYPE_LABELS[item.type] ?? item.type, `${item.weight} kg`];

    if (item.type === 'food' && item.value > 0) parts.push(`+${item.value} kcal`);
    if (item.type === 'drink' && item.value > 0) parts.push(`+${item.value}% H2O`);
    if (item.type === 'weapon' && item.damage > 0) parts.push(`Damage ${item.damage}`);
    if (item.defense > 0) parts.push(`Defense ${item.defense}`);
    if (item.slots > 0) parts.push(`+${item.slots} slots`);
    if (item.capacity > 0) parts.push(`+${item.capacity} kg capacity`);
    if (item.effects) parts.push(`Effects: ${item.effects}`);
    if (item.count > 1) parts.push(`x${item.count}`);

    return parts.join(' · ');
}
