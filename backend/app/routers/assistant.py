import os
import re
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, ChatMessage, RecyclingGuide
from app.schemas import ChatMessageCreate, ChatMessageOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/assistant", tags=["AI Recycling Assistant"])

# Knowledge base answers for local rule-based response engine
RECYCLING_QA_KNOWLEDGE = [
    {
        "keywords": ["plastic", "bottle", "jug", "container", "pet", "hdpe"],
        "answer": (
            "**Plastic Recycling Rules:**\n\n"
            "• **Types 1 (PET)** (water/soda bottles) and **2 (HDPE)** (milk jugs, shampoo bottles) are universally accepted.\n"
            "• **Preparation:** Empty liquids, give a quick cold-water rinse, and keep the screw caps on.\n"
            "• **Thin plastic film / grocery bags:** Do NOT put in curbside bins as they tangle in sorting gears. Take them to supermarket drop-off kiosks.\n"
            "• **Black plastic:** Many optical sorters cannot detect black carbon pigments; check with local facility."
        )
    },
    {
        "keywords": ["pizza", "grease", "greasy", "food box"],
        "answer": (
            "**Pizza Box Disposal Guidance:**\n\n"
            "• **Grease is the enemy of paper recycling:** Oil cannot be separated from paper fibres during water-based pulping.\n"
            "• **The Golden Rule:** Tear the box in half! The clean, unsoiled top lid can be recycled with cardboard.\n"
            "• The greasy, cheese-stained bottom section belongs in organic compost (if your city accepts food-soiled paper) or general trash."
        )
    },
    {
        "keywords": ["e-waste", "electronic", "battery", "phone", "laptop", "cable", "charger", "lithium"],
        "answer": (
            "**Electronic Waste (E-Waste) & Battery Safety:**\n\n"
            "• **NEVER put batteries in regular trash or recycling bins.** Lithium-ion and rechargeable batteries cause severe truck and facility fires when crushed.\n"
            "• **Drop-off locations:** Many electronic retailers and municipal transfer stations offer free drop boxes for household batteries and old mobile phones.\n"
            "• **Data security:** Always factory-reset smartphones, tablets, and hard drives before donating or recycling them."
        )
    },
    {
        "keywords": ["glass", "broken", "jar", "mirror", "window", "pyrex"],
        "answer": (
            "**Glass Segregation & Safety:**\n\n"
            "• **Recyclable:** Beverage bottles and food jars (clear, green, amber). Glass is infinitely recyclable!\n"
            "• **Non-Recyclable with containers:** Pyrex, cookware, window panes, light bulbs, and mirrors. They have different melting points and will ruin a batch of recycled glass.\n"
            "• **Broken glass safety:** Wrap sharp shards securely in cardboard or newspaper, tape shut, and place in general trash to protect municipal workers."
        )
    },
    {
        "keywords": ["metal", "can", "aluminum", "tin", "foil"],
        "answer": (
            "**Metal & Aluminum Recycling:**\n\n"
            "• Aluminum and steel cans are among the most valuable recyclable commodities. Recycling aluminum uses **95% less energy** than smelting from bauxite ore.\n"
            "• **Preparation:** Rinse food residue. No need to crush cans unless you need to save space.\n"
            "• **Foil:** Scrunch clean aluminum foil into a ball at least the size of a fist so sorting machinery can capture it."
        )
    },
    {
        "keywords": ["compost", "organic", "food waste", "banana", "scraps", "leaves"],
        "answer": (
            "**Composting Fundamentals:**\n\n"
            "• **Green Materials (Nitrogen):** Fruit & vegetable peels, coffee grounds, green garden trimmings.\n"
            "• **Brown Materials (Carbon):** Dry leaves, shredded unprinted cardboard, straw, twigs.\n"
            "• **Ideal Ratio:** Roughly 2 to 3 parts Browns for every 1 part Greens.\n"
            "• **Avoid in backyard compost:** Meat, bones, dairy, and pet feces, as they attract pests and pathogens."
        )
    },
    {
        "keywords": ["paper", "shred", "receipt", "newspaper", "envelope"],
        "answer": (
            "**Paper Recycling Standards:**\n\n"
            "• **Recyclable:** Newspapers, magazines, cardboard, mail, envelopes (even plastic windows are usually filtered out).\n"
            "• **Do not recycle:** Thermal cash register receipts (contain BPA/BPS coatings), paper towels, or waxed paper.\n"
            "• **Shredded paper:** Avoid shredding unless confidential; tiny fibres fall through sorting screens."
        )
    },
    {
        "keywords": ["hazardous", "paint", "chemical", "solvent", "fluorescent", "cleaner"],
        "answer": (
            "**Household Hazardous Waste (HHW):**\n\n"
            "• **Items:** Oil-based paints, motor oil, pesticides, drain cleaners, and fluorescent tubes containing mercury.\n"
            "• **Disposal:** Never pour down stormwater drains or kitchen sinks. Take to a designated municipal hazardous waste collection day or depot.\n"
            "• Keep in original labelled containers whenever possible."
        )
    }
]

def generate_assistant_response(query: str, db: Session) -> str:
    query_lower = query.lower()
    
    # 1. Search knowledge base entries
    for item in RECYCLING_QA_KNOWLEDGE:
        for kw in item["keywords"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', query_lower):
                return item["answer"]
                
    # 2. Check if asking about a category from recycling guides
    guides = db.query(RecyclingGuide).all()
    for g in guides:
        if g.category_key in query_lower or g.title.lower() in query_lower:
            return (
                f"**{g.title} Recycling Overview:**\n\n"
                f"{g.short_description}\n\n"
                f"• **Recommended Disposal:** {g.disposal_method}\n"
                f"• **Preparation:** {', '.join(g.preparation_steps[:2])}.\n"
                f"• **Environmental Impact:** {g.environmental_impact}"
            )
            
    # Default helpful response
    return (
        "I can help you recycle and dispose of waste responsibly! You can ask me about:\n\n"
        "• How to recycle specific materials (plastics #1-#7, cardboard, glass, metals)\n"
        "• What to do with greasy pizza boxes or broken glass\n"
        "• E-waste and battery disposal safety precautions\n"
        "• How to start home composting and ideal green/brown balance\n"
        "• Identifying safe handling for hazardous household items\n\n"
        "*What material or item would you like guidance on?*"
    )

@router.get("/history", response_model=List[ChatMessageOut])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.asc()).all()
    return messages

@router.post("/chat", response_model=ChatMessageOut)
def send_chat_message(
    msg_in: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reply_text = generate_assistant_response(msg_in.content, db)
    try:
        # Save user message
        user_msg = ChatMessage(
            user_id=current_user.id,
            role="user",
            content=msg_in.content.strip()
        )
        db.add(user_msg)
        
        asst_msg = ChatMessage(
            user_id=current_user.id,
            role="assistant",
            content=reply_text
        )
        db.add(asst_msg)
        
        db.commit()
        db.refresh(asst_msg)
        return asst_msg
    except Exception as e:
        db.rollback()
        print(f"[Assistant] DB notice: {e}")
        return ChatMessageOut(
            id=int(datetime.datetime.utcnow().timestamp() * 1000),
            role="assistant",
            content=reply_text,
            created_at=datetime.datetime.utcnow()
        )

@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return None
