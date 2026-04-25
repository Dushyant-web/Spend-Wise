"""
Deep 12-month seed: realistic Indian college student (middle-class, Delhi NCR).
Profile: 2nd-year B.Tech student at Sharda University, Greater Noida.
Monthly pocket money: ₹12,000 from parents + ₹2,000-4,000 occasional part-time.
Lives in hostel (fees paid separately by parents).

Run: python scripts/seed.py
"""
import asyncio
import uuid
from datetime import date, timedelta
from decimal import Decimal
from typing import List, Tuple

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.models import Base
from app.models.user import User, UserStats
from app.models.expense import Expense
from app.models.budget import Budget
from app.core.security import hash_password

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# ── helpers ───────────────────────────────────────────────────────────────────

def d(amount: str) -> Decimal:
    return Decimal(amount)

def expense(
    user_id: uuid.UUID,
    amount: str,
    category: str,
    merchant: str,
    payment_mode: str,
    exp_date: date,
    note: str = "",
    is_recurring: bool = False,
) -> Expense:
    return Expense(
        user_id=user_id,
        amount=d(amount),
        category=category,
        merchant=merchant,
        payment_mode=payment_mode,
        expense_date=exp_date,
        note=note or None,
        is_recurring=is_recurring,
    )

# ── month-by-month data ───────────────────────────────────────────────────────

def may_2025(uid: uuid.UUID) -> List[Expense]:
    """Summer vacation month. Back home in Faridabad. Hangouts, travel, summer heat."""
    m = 5; y = 2025
    return [
        # Travel: bus back home after semester end
        expense(uid, "650", "transport", "Rajdhani Bus", "upi", date(y,m,1), "Bus to Faridabad"),
        expense(uid, "180", "food", "McDonald's", "upi", date(y,m,2)),
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "450", "food", "Barbeque Nation", "card", date(y,m,4), "friends outing"),
        expense(uid, "85", "food", "Chai Point", "upi", date(y,m,5)),
        expense(uid, "199", "shopping", "Myntra - Shorts", "card", date(y,m,6), "summer shorts"),
        expense(uid, "320", "food", "Domino's", "upi", date(y,m,7)),
        expense(uid, "120", "transport", "Rapido", "upi", date(y,m,8)),
        expense(uid, "150", "food", "Swiggy - Biryani", "upi", date(y,m,9)),
        expense(uid, "89", "food", "Haldiram's Sweets", "cash", date(y,m,10)),
        expense(uid, "599", "entertainment", "PVR Movie - Gadar 2 rewatch", "upi", date(y,m,11), "with friends"),
        expense(uid, "240", "food", "Burger King", "upi", date(y,m,12)),
        expense(uid, "750", "shopping", "Flipkart - Shoes", "card", date(y,m,13)),
        expense(uid, "45", "food", "Nimbu Pani stall", "cash", date(y,m,14)),
        expense(uid, "180", "food", "Swiggy - Poha", "upi", date(y,m,15)),
        expense(uid, "110", "transport", "Auto", "cash", date(y,m,16)),
        expense(uid, "399", "entertainment", "Spotify Premium 3mo", "upi", date(y,m,17)),
        expense(uid, "260", "food", "KFC", "upi", date(y,m,18)),
        expense(uid, "350", "emergency", "Cipla - Cold medicine", "cash", date(y,m,19), "summer cold"),
        expense(uid, "75", "food", "Maggie at home", "cash", date(y,m,20)),
        expense(uid, "980", "shopping", "Amazon - Fan for room", "card", date(y,m,21), "summer heat"),
        expense(uid, "200", "food", "Zomato - Pizza", "upi", date(y,m,22)),
        expense(uid, "150", "transport", "Ola", "upi", date(y,m,23)),
        expense(uid, "130", "food", "Chai + Samosa canteen", "cash", date(y,m,24)),
        expense(uid, "499", "entertainment", "Steam - Hollow Knight", "card", date(y,m,25)),
        expense(uid, "200", "food", "Swiggy - Chole Bhature", "upi", date(y,m,26)),
        expense(uid, "80", "transport", "Metro card recharge", "upi", date(y,m,27)),
        expense(uid, "340", "food", "Dinner with family - Punjabi Tadka", "upi", date(y,m,28)),
        expense(uid, "120", "miscellaneous", "Haircut - Jawed Habib", "cash", date(y,m,29)),
        expense(uid, "180", "food", "Zomato - Butter Chicken", "upi", date(y,m,30)),
        expense(uid, "89", "food", "Frooti + Chips", "cash", date(y,m,31)),
    ]

def june_2025(uid: uuid.UUID) -> List[Expense]:
    """New semester begins. Book buying spree, stationery, hostel setup again."""
    m = 6; y = 2025
    return [
        expense(uid, "680", "transport", "Rajdhani Bus back to college", "upi", date(y,m,1)),
        expense(uid, "1200", "education", "DS & Algorithms book", "upi", date(y,m,2), "Cormen"),
        expense(uid, "850", "education", "DBMS + OS books", "upi", date(y,m,3)),
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "450", "education", "Stationery - Classmate notebooks x6", "cash", date(y,m,4)),
        expense(uid, "180", "food", "Campus Canteen - first week", "cash", date(y,m,4)),
        expense(uid, "2800", "food", "Mess fee - June", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "120", "food", "Maggi + chai hostel", "cash", date(y,m,6)),
        expense(uid, "350", "education", "Udemy - Python course (sale)", "card", date(y,m,7)),
        expense(uid, "90", "food", "Canteen dinner", "cash", date(y,m,8)),
        expense(uid, "200", "transport", "Metro recharge", "upi", date(y,m,9)),
        expense(uid, "180", "food", "Zomato - Burger", "upi", date(y,m,10)),
        expense(uid, "65", "education", "Xerox notes - 65 pages", "cash", date(y,m,11)),
        expense(uid, "150", "food", "Swiggy - Thali", "upi", date(y,m,12)),
        expense(uid, "350", "shopping", "Decathlon - Sports water bottle + socks", "upi", date(y,m,13)),
        expense(uid, "85", "food", "Pav Bhaji near hostel", "cash", date(y,m,14)),
        expense(uid, "200", "entertainment", "Movie - Inside Out 2 PVR", "upi", date(y,m,15)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,16)),
        expense(uid, "240", "food", "Domino's with roommate", "upi", date(y,m,17)),
        expense(uid, "45", "food", "Chai 3x", "cash", date(y,m,18)),
        expense(uid, "599", "education", "GeeksforGeeks premium 3mo", "card", date(y,m,19)),
        expense(uid, "160", "food", "Swiggy - Egg rolls", "upi", date(y,m,20)),
        expense(uid, "100", "transport", "Auto to market", "cash", date(y,m,21)),
        expense(uid, "180", "food", "Canteen + snacks", "cash", date(y,m,22)),
        expense(uid, "280", "shopping", "Flipkart - Pen drive 32GB", "upi", date(y,m,23)),
        expense(uid, "90", "food", "Chai + Maggi night", "cash", date(y,m,24)),
        expense(uid, "200", "food", "Zomato - Paneer Butter Masala", "upi", date(y,m,25)),
        expense(uid, "150", "emergency", "Pharmacy - vitamins", "cash", date(y,m,26)),
        expense(uid, "80", "food", "Canteen lunch", "cash", date(y,m,27)),
        expense(uid, "450", "shopping", "Amazon - Keyboard cover + mouse pad", "card", date(y,m,28)),
        expense(uid, "120", "food", "Swiggy - Samosa + Chai", "upi", date(y,m,29)),
        expense(uid, "2800", "food", "Mess fee - July advance", "upi", date(y,m,30), is_recurring=True),
    ]

def july_2025(uid: uuid.UUID) -> List[Expense]:
    """Monsoon month. More indoor spending, chai, hot food. Semester in full swing."""
    m = 7; y = 2025
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "280", "shopping", "Flipkart - Umbrella + Raincoat", "upi", date(y,m,1), "monsoon prep"),
        expense(uid, "160", "food", "Chai + Pakoda stall near hostel", "cash", date(y,m,2)),
        expense(uid, "200", "food", "Zomato - Hot soup + momos", "upi", date(y,m,3)),
        expense(uid, "120", "transport", "Ola - rain day", "upi", date(y,m,4)),
        expense(uid, "90", "food", "Canteen", "cash", date(y,m,5)),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "350", "food", "Swiggy - Biryani party room", "upi", date(y,m,6)),
        expense(uid, "180", "food", "Maggi + coffee late night", "cash", date(y,m,7)),
        expense(uid, "75", "food", "Chai x5 week", "cash", date(y,m,8)),
        expense(uid, "450", "education", "Assignment printing + binding", "cash", date(y,m,9)),
        expense(uid, "250", "food", "Domino's", "upi", date(y,m,10)),
        expense(uid, "130", "transport", "Metro + Auto", "upi", date(y,m,11)),
        expense(uid, "199", "shopping", "Amazon - Earphones replacement", "card", date(y,m,12)),
        expense(uid, "180", "food", "Canteen + evening snacks", "cash", date(y,m,13)),
        expense(uid, "300", "entertainment", "Bowling - mall outing friends", "upi", date(y,m,14)),
        expense(uid, "220", "food", "KFC Bucket (split)", "upi", date(y,m,15)),
        expense(uid, "80", "food", "Chai stall daily", "cash", date(y,m,16)),
        expense(uid, "150", "emergency", "Crocin + ORS - fever", "cash", date(y,m,17)),
        expense(uid, "200", "food", "Zomato - Khichdi (sick day)", "upi", date(y,m,18)),
        expense(uid, "120", "food", "Canteen lunch", "cash", date(y,m,19)),
        expense(uid, "1200", "education", "Software Engineering book + CN book", "upi", date(y,m,20)),
        expense(uid, "90", "food", "Maggi night", "cash", date(y,m,21)),
        expense(uid, "340", "food", "Swiggy - Weekend special", "upi", date(y,m,22)),
        expense(uid, "150", "transport", "Auto + metro", "cash", date(y,m,23)),
        expense(uid, "59", "entertainment", "Spotify monthly", "upi", date(y,m,24), is_recurring=True),
        expense(uid, "180", "food", "Burger King", "upi", date(y,m,25)),
        expense(uid, "75", "food", "Chai + biscuits room", "cash", date(y,m,26)),
        expense(uid, "250", "shopping", "Amazon - Extra pen drive", "card", date(y,m,27)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,28)),
        expense(uid, "200", "food", "Zomato - Dal Makhani", "upi", date(y,m,29)),
        expense(uid, "100", "miscellaneous", "Haircut", "cash", date(y,m,30)),
    ]

def august_2025(uid: uuid.UUID) -> List[Expense]:
    """Independence Day. Patriotic vibes, college fest prep. Raksha Bandhan - sent gift home."""
    m = 8; y = 2025
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "180", "food", "Zomato - Breakfast", "upi", date(y,m,1)),
        expense(uid, "350", "shopping", "Flag + decoration for room 15 Aug", "cash", date(y,m,10)),
        expense(uid, "240", "food", "Canteen celebration dinner", "cash", date(y,m,15), "Independence Day"),
        expense(uid, "199", "food", "Domino's", "upi", date(y,m,2)),
        expense(uid, "90", "food", "Chai x week", "cash", date(y,m,4)),
        expense(uid, "450", "shopping", "Raksha Bandhan - Boat earphones for sister", "upi", date(y,m,8)),
        expense(uid, "280", "food", "Swiggy - Biryani + Raita", "upi", date(y,m,9)),
        expense(uid, "150", "transport", "Bus to Delhi for Rakhi", "upi", date(y,m,11)),
        expense(uid, "300", "food", "Home food + sweets", "cash", date(y,m,11)),
        expense(uid, "150", "transport", "Bus back", "upi", date(y,m,12)),
        expense(uid, "130", "food", "Canteen", "cash", date(y,m,13)),
        expense(uid, "400", "entertainment", "College fest - entry + food stalls", "cash", date(y,m,16)),
        expense(uid, "200", "food", "KFC post-fest", "upi", date(y,m,16)),
        expense(uid, "80", "food", "Chai", "cash", date(y,m,17)),
        expense(uid, "750", "education", "Mid-sem prep - printouts + notes", "cash", date(y,m,18)),
        expense(uid, "180", "food", "Swiggy - study night food", "upi", date(y,m,19)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,20)),
        expense(uid, "200", "food", "Zomato - Post exam treat", "upi", date(y,m,22)),
        expense(uid, "350", "shopping", "Amazon - Highlighters + pens set", "card", date(y,m,23)),
        expense(uid, "160", "food", "Burger", "upi", date(y,m,24)),
        expense(uid, "90", "food", "Evening snacks canteen", "cash", date(y,m,25)),
        expense(uid, "250", "food", "Domino's with floor mates", "upi", date(y,m,26)),
        expense(uid, "200", "transport", "Ola/Metro week", "upi", date(y,m,27)),
        expense(uid, "180", "food", "Swiggy - Rajma Chawal", "upi", date(y,m,28)),
        expense(uid, "120", "food", "Maggi + chai night", "cash", date(y,m,29)),
        expense(uid, "600", "entertainment", "Movie + mall hangout", "upi", date(y,m,30)),
    ]

def september_2025(uid: uuid.UUID) -> List[Expense]:
    """Mid-sem exams. High stress = high food delivery. Less entertainment."""
    m = 9; y = 2025
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "200", "food", "Zomato - study night biryani", "upi", date(y,m,1)),
        expense(uid, "80", "food", "Chai morning exam", "cash", date(y,m,2)),
        expense(uid, "120", "food", "Canteen between exams", "cash", date(y,m,3)),
        expense(uid, "180", "food", "Swiggy - Burger", "upi", date(y,m,4)),
        expense(uid, "350", "education", "LeetCode Premium 1mo", "card", date(y,m,5)),
        expense(uid, "90", "food", "Red Bull x2 exam week", "cash", date(y,m,6)),
        expense(uid, "240", "food", "Domino's post exam relief", "upi", date(y,m,8)),
        expense(uid, "130", "food", "Canteen", "cash", date(y,m,9)),
        expense(uid, "200", "food", "Zomato late night dal rice", "upi", date(y,m,10)),
        expense(uid, "150", "transport", "Auto + Metro", "upi", date(y,m,11)),
        expense(uid, "80", "food", "Chai daily", "cash", date(y,m,12)),
        expense(uid, "499", "education", "Coursera ML course (financial aid)", "card", date(y,m,13)),
        expense(uid, "200", "food", "Swiggy - Pizza slice", "upi", date(y,m,14)),
        expense(uid, "160", "food", "Canteen", "cash", date(y,m,15)),
        expense(uid, "350", "food", "Post mid-sem treat - Barbeque", "upi", date(y,m,16), "split 4 people"),
        expense(uid, "200", "shopping", "Amazon - Extension cord", "card", date(y,m,17)),
        expense(uid, "90", "food", "Chai + snacks", "cash", date(y,m,18)),
        expense(uid, "180", "food", "Zomato", "upi", date(y,m,19)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,20)),
        expense(uid, "100", "miscellaneous", "Haircut", "cash", date(y,m,21)),
        expense(uid, "350", "food", "KFC - weekend outing", "upi", date(y,m,22)),
        expense(uid, "200", "entertainment", "Movie - Stree 2", "upi", date(y,m,23)),
        expense(uid, "150", "food", "Swiggy", "upi", date(y,m,24)),
        expense(uid, "80", "food", "Maggi night", "cash", date(y,m,25)),
        expense(uid, "250", "shopping", "D-Mart monthly supplies", "cash", date(y,m,26)),
        expense(uid, "200", "food", "Zomato weekend", "upi", date(y,m,27)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,28)),
        expense(uid, "180", "food", "Swiggy Butter Chicken", "upi", date(y,m,29)),
    ]

def october_2025(uid: uuid.UUID) -> List[Expense]:
    """Pre-Diwali shopping. Navratri. Higher entertainment and shopping."""
    m = 10; y = 2025
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "200", "food", "Zomato - breakfast", "upi", date(y,m,1)),
        expense(uid, "1200", "shopping", "Myntra - Ethnic kurta for Navratri", "card", date(y,m,2)),
        expense(uid, "450", "food", "Garba night snacks + entry", "cash", date(y,m,3)),
        expense(uid, "180", "food", "Canteen", "cash", date(y,m,4)),
        expense(uid, "350", "shopping", "Flipkart - Diwali sale: charger + cable", "upi", date(y,m,6)),
        expense(uid, "800", "shopping", "Amazon Diwali sale - Headphones", "card", date(y,m,8)),
        expense(uid, "250", "food", "Domino's", "upi", date(y,m,9)),
        expense(uid, "120", "food", "Chai + Samosa", "cash", date(y,m,10)),
        expense(uid, "1800", "shopping", "Myntra - Jeans + T-shirts (3) Diwali", "card", date(y,m,11)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,12)),
        expense(uid, "350", "entertainment", "Dandiya event college", "cash", date(y,m,13)),
        expense(uid, "160", "food", "Canteen", "cash", date(y,m,14)),
        expense(uid, "500", "shopping", "Flipkart - Gifts for family (Diwali)", "upi", date(y,m,15)),
        expense(uid, "200", "food", "Swiggy", "upi", date(y,m,16)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,17)),
        expense(uid, "400", "food", "Barbeque Nation pre-Diwali", "upi", date(y,m,18)),
        expense(uid, "250", "transport", "Bus home for Diwali break", "upi", date(y,m,19)),
        expense(uid, "600", "shopping", "Sweets + dry fruits for home - Big Bazaar", "cash", date(y,m,20)),
        expense(uid, "800", "shopping", "Crackers (small pack)", "cash", date(y,m,21)),
        expense(uid, "300", "food", "Home Diwali food + restaurants family", "cash", date(y,m,22)),
        expense(uid, "200", "food", "Sweets shop - Bikanervala", "cash", date(y,m,23)),
        expense(uid, "250", "transport", "Bus back to college", "upi", date(y,m,26)),
        expense(uid, "180", "food", "Zomato back at hostel", "upi", date(y,m,27)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,28)),
        expense(uid, "200", "food", "Domino's", "upi", date(y,m,29)),
        expense(uid, "350", "entertainment", "Halloween party college (costume stuff)", "cash", date(y,m,31)),
    ]

def november_2025(uid: uuid.UUID) -> List[Expense]:
    """Post-Diwali. End-sem approaching. More study, less fun. November chill."""
    m = 11; y = 2025
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "180", "food", "Canteen + chai", "cash", date(y,m,1)),
        expense(uid, "200", "food", "Zomato - Dal Makhani", "upi", date(y,m,2)),
        expense(uid, "400", "education", "End sem notes printing + binding", "cash", date(y,m,3)),
        expense(uid, "150", "food", "Swiggy", "upi", date(y,m,4)),
        expense(uid, "90", "food", "Maggi night study", "cash", date(y,m,5)),
        expense(uid, "350", "education", "DSA practice book", "upi", date(y,m,6)),
        expense(uid, "160", "food", "Canteen", "cash", date(y,m,7)),
        expense(uid, "200", "food", "Zomato midnight snacks", "upi", date(y,m,8)),
        expense(uid, "80", "food", "Chai x daily", "cash", date(y,m,9)),
        expense(uid, "250", "shopping", "Flipkart - Winter jacket (sale)", "card", date(y,m,10)),
        expense(uid, "180", "food", "Swiggy - Soup cold evening", "upi", date(y,m,11)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,12)),
        expense(uid, "100", "miscellaneous", "Haircut", "cash", date(y,m,13)),
        expense(uid, "350", "food", "Domino's birthday treat (friend)", "upi", date(y,m,14)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,15)),
        expense(uid, "90", "food", "Chai + biscuits", "cash", date(y,m,16)),
        expense(uid, "280", "shopping", "Amazon - Thermals for winter", "card", date(y,m,17)),
        expense(uid, "180", "food", "Swiggy Biryani", "upi", date(y,m,18)),
        expense(uid, "130", "food", "Canteen dinner", "cash", date(y,m,19)),
        expense(uid, "200", "food", "Zomato - study break", "upi", date(y,m,20)),
        expense(uid, "80", "food", "Coffee Starbucks (one time treat)", "upi", date(y,m,21)),
        expense(uid, "350", "food", "KFC post submission", "upi", date(y,m,22)),
        expense(uid, "150", "transport", "Metro week", "upi", date(y,m,23)),
        expense(uid, "200", "food", "Swiggy", "upi", date(y,m,24)),
        expense(uid, "90", "food", "Chai + Paratha morning", "cash", date(y,m,25)),
        expense(uid, "500", "education", "Mock placement test fee", "upi", date(y,m,26)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,27)),
        expense(uid, "650", "transport", "Bus home end-sem break", "upi", date(y,m,28)),
    ]

def december_2025(uid: uuid.UUID) -> List[Expense]:
    """Winter break. Home. End-sem results. Christmas/New Year."""
    m = 12; y = 2025
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "180", "food", "McDonald's back home", "upi", date(y,m,1)),
        expense(uid, "450", "entertainment", "PVR - Pushpa 2 first day", "upi", date(y,m,5), "block buster movie"),
        expense(uid, "280", "food", "Dinner with school friends - Pizza Hut", "upi", date(y,m,6)),
        expense(uid, "120", "food", "Chai adda", "cash", date(y,m,7)),
        expense(uid, "800", "shopping", "Meesho - winter clothes for college", "upi", date(y,m,8)),
        expense(uid, "200", "food", "Zomato home", "upi", date(y,m,9)),
        expense(uid, "350", "entertainment", "New Netflix subscription (own)", "card", date(y,m,10)),
        expense(uid, "180", "food", "Burger King", "upi", date(y,m,11)),
        expense(uid, "500", "shopping", "Amazon - Bluetooth speaker gifting", "card", date(y,m,12)),
        expense(uid, "150", "food", "Swiggy", "upi", date(y,m,13)),
        expense(uid, "90", "food", "Chai + Paratha", "cash", date(y,m,14)),
        expense(uid, "200", "food", "Domino's family order", "upi", date(y,m,15)),
        expense(uid, "1500", "shopping", "Myntra winter sale - shoes + jacket", "card", date(y,m,16)),
        expense(uid, "300", "food", "Christmas party food contribution", "cash", date(y,m,25), "church event"),
        expense(uid, "200", "food", "Zomato Christmas", "upi", date(y,m,25)),
        expense(uid, "800", "entertainment", "New Year party entry + drinks", "upi", date(y,m,31)),
        expense(uid, "350", "food", "Barbeque NYE family", "upi", date(y,m,31)),
        expense(uid, "120", "food", "Snacks party", "cash", date(y,m,30)),
        expense(uid, "180", "transport", "Uber late night", "upi", date(y,m,31)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,20)),
        expense(uid, "250", "food", "Swiggy mid-month", "upi", date(y,m,18)),
    ]

def january_2026(uid: uuid.UUID) -> List[Expense]:
    """New year, new semester. Resolutions to save money (broken by day 5)."""
    m = 1; y = 2026
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "350", "entertainment", "Netflix monthly", "card", date(y,m,10), is_recurring=True),
        expense(uid, "650", "transport", "Bus back to college after holidays", "upi", date(y,m,2)),
        expense(uid, "180", "food", "Canteen first day back", "cash", date(y,m,3)),
        expense(uid, "400", "education", "New semester books - 2 nos", "upi", date(y,m,4)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,5)),
        expense(uid, "250", "education", "Stationery new semester", "cash", date(y,m,6)),
        expense(uid, "160", "food", "Canteen", "cash", date(y,m,7)),
        expense(uid, "350", "food", "Swiggy - New year vibe still", "upi", date(y,m,8)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,9)),
        expense(uid, "200", "food", "Domino's", "upi", date(y,m,10)),
        expense(uid, "750", "education", "Internshala premium - placement prep", "card", date(y,m,11)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,12)),
        expense(uid, "180", "food", "Zomato - Dal Rice", "upi", date(y,m,13)),
        expense(uid, "100", "miscellaneous", "Haircut", "cash", date(y,m,14)),
        expense(uid, "300", "food", "KFC Republic Day outing", "upi", date(y,m,26)),
        expense(uid, "200", "food", "Swiggy", "upi", date(y,m,15)),
        expense(uid, "80", "food", "Chai snacks", "cash", date(y,m,16)),
        expense(uid, "350", "entertainment", "Makar Sankranti kite + snacks", "cash", date(y,m,14)),
        expense(uid, "240", "food", "Zomato", "upi", date(y,m,18)),
        expense(uid, "180", "food", "Canteen", "cash", date(y,m,19)),
        expense(uid, "200", "food", "Burger King", "upi", date(y,m,20)),
        expense(uid, "150", "transport", "Metro week", "upi", date(y,m,21)),
        expense(uid, "180", "food", "Swiggy", "upi", date(y,m,22)),
        expense(uid, "90", "food", "Chai + Samosa", "cash", date(y,m,23)),
        expense(uid, "200", "food", "Domino's", "upi", date(y,m,24)),
        expense(uid, "600", "education", "Mock interview platform 1mo", "card", date(y,m,25)),
    ]

def february_2026(uid: uuid.UUID) -> List[Expense]:
    """Valentine's + mid-sem. Slight spike in entertainment."""
    m = 2; y = 2026
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "350", "entertainment", "Netflix", "card", date(y,m,10), is_recurring=True),
        expense(uid, "180", "food", "Canteen", "cash", date(y,m,1)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,2)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,3)),
        expense(uid, "250", "food", "Swiggy", "upi", date(y,m,4)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,5)),
        expense(uid, "450", "shopping", "Myntra - Valentine gift for friend", "upi", date(y,m,12)),
        expense(uid, "800", "food", "Valentine dinner - Italian restaurant", "card", date(y,m,14), "date night"),
        expense(uid, "200", "entertainment", "Roses + chocolates", "cash", date(y,m,14)),
        expense(uid, "160", "food", "Domino's", "upi", date(y,m,7)),
        expense(uid, "90", "food", "Chai daily", "cash", date(y,m,8)),
        expense(uid, "180", "food", "Burger King", "upi", date(y,m,9)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,10)),
        expense(uid, "300", "education", "Mid sem printing", "cash", date(y,m,15)),
        expense(uid, "180", "food", "Swiggy - exam food", "upi", date(y,m,16)),
        expense(uid, "90", "food", "Red Bull exam", "cash", date(y,m,17)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,18)),
        expense(uid, "200", "food", "Zomato post exam", "upi", date(y,m,19)),
        expense(uid, "350", "food", "KFC celebration mid-sem over", "upi", date(y,m,20)),
        expense(uid, "100", "miscellaneous", "Haircut", "cash", date(y,m,21)),
        expense(uid, "180", "food", "Swiggy", "upi", date(y,m,22)),
        expense(uid, "250", "shopping", "Amazon - Stationary + files", "card", date(y,m,23)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,24)),
        expense(uid, "200", "food", "Domino's", "upi", date(y,m,25)),
        expense(uid, "150", "transport", "Auto + metro", "upi", date(y,m,26)),
        expense(uid, "180", "food", "Zomato", "upi", date(y,m,27)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,28)),
    ]

def march_2026(uid: uuid.UUID) -> List[Expense]:
    """Holi festival! High fun spending. Colors, water guns, sweets. End-sem approaching."""
    m = 3; y = 2026
    return [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "350", "entertainment", "Netflix", "card", date(y,m,10), is_recurring=True),
        expense(uid, "600", "shopping", "Holi colors + water gun + white tshirt", "cash", date(y,m,12), "Holi prep"),
        expense(uid, "400", "food", "Holi special - Gujiya + Thandai", "cash", date(y,m,14), "Holi"),
        expense(uid, "250", "food", "Holi party food contribution hostel", "cash", date(y,m,14)),
        expense(uid, "180", "shopping", "Meesho - new white kurta for Holi", "upi", date(y,m,10)),
        expense(uid, "200", "food", "Canteen", "cash", date(y,m,1)),
        expense(uid, "180", "food", "Zomato", "upi", date(y,m,2)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,3)),
        expense(uid, "200", "food", "Swiggy", "upi", date(y,m,4)),
        expense(uid, "350", "education", "End-sem notes printing", "cash", date(y,m,16)),
        expense(uid, "180", "food", "Domino's", "upi", date(y,m,6)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,7)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,8)),
        expense(uid, "250", "food", "KFC outing", "upi", date(y,m,9)),
        expense(uid, "90", "food", "Chai + evening", "cash", date(y,m,11)),
        expense(uid, "400", "food", "Post-Holi treat restaurant", "upi", date(y,m,15)),
        expense(uid, "200", "food", "Swiggy exam prep", "upi", date(y,m,17)),
        expense(uid, "80", "food", "Chai", "cash", date(y,m,18)),
        expense(uid, "180", "food", "Zomato", "upi", date(y,m,19)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,20)),
        expense(uid, "350", "food", "Burger King group", "upi", date(y,m,21)),
        expense(uid, "200", "food", "Domino's", "upi", date(y,m,22)),
        expense(uid, "100", "miscellaneous", "Haircut", "cash", date(y,m,23)),
        expense(uid, "180", "food", "Swiggy", "upi", date(y,m,24)),
        expense(uid, "650", "transport", "Home for Holi extended", "upi", date(y,m,25)),
        expense(uid, "300", "food", "Home food + sweets", "cash", date(y,m,26)),
        expense(uid, "200", "food", "Sweets - Mithai shop", "cash", date(y,m,27)),
        expense(uid, "650", "transport", "Back to college", "upi", date(y,m,30)),
        expense(uid, "180", "food", "Zomato back hostel", "upi", date(y,m,31)),
    ]

def april_2026(uid: uuid.UUID) -> List[Expense]:
    """Current month - end of academic year, results tension, some celebration."""
    m = 4; y = 2026
    today = date.today()
    rows = [
        expense(uid, "239", "bills", "Jio Recharge", "upi", date(y,m,3), is_recurring=True),
        expense(uid, "299", "entertainment", "Amazon Prime", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "2800", "food", "Mess fee", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "59", "entertainment", "Spotify", "upi", date(y,m,5), is_recurring=True),
        expense(uid, "350", "entertainment", "Netflix", "card", date(y,m,10), is_recurring=True),
        expense(uid, "180", "food", "Zomato - April morning", "upi", date(y,m,1)),
        expense(uid, "90", "food", "Chai", "cash", date(y,m,2)),
        expense(uid, "200", "food", "Swiggy", "upi", date(y,m,3)),
        expense(uid, "250", "food", "Domino's", "upi", date(y,m,4)),
        expense(uid, "120", "food", "Canteen", "cash", date(y,m,5)),
        expense(uid, "350", "education", "End-sem prep material", "cash", date(y,m,6)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,7)),
        expense(uid, "80", "food", "Chai exam", "cash", date(y,m,8)),
        expense(uid, "180", "food", "Swiggy", "upi", date(y,m,9)),
        expense(uid, "400", "food", "KFC year-end treat", "upi", date(y,m,10)),
        expense(uid, "150", "transport", "Metro", "upi", date(y,m,11)),
        expense(uid, "200", "food", "Zomato", "upi", date(y,m,12)),
        expense(uid, "90", "food", "Chai + Samosa", "cash", date(y,m,13)),
    ]
    # Only add expenses up to today
    return [e for e in rows if e.expense_date <= today]


# ── main ──────────────────────────────────────────────────────────────────────

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        user_id = uuid.uuid4()
        user = User(
            id=user_id,
            email="di@gmail.com",
            name="Dipanker",
            hashed_password=hash_password("Di@1"),
            is_verified=True,
            college="Sharda University",
            city="Greater Noida",
            monthly_income=Decimal("12000"),
        )
        db.add(user)

        stats = UserStats(
            user_id=user_id,
            total_xp=680,
            current_level=7,
            current_streak=5,
            longest_streak=21,
            total_saved=Decimal("3400"),
            smart_spender_rank="silver",
        )
        db.add(stats)

        # Monthly budgets (12 months)
        for month_offset in range(12):
            target = date(2025, 5, 1)
            m = ((target.month - 1 + month_offset) % 12) + 1
            y = target.year + ((target.month - 1 + month_offset) // 12)
            db.add(Budget(
                user_id=user_id,
                month=m,
                year=y,
                monthly_limit=Decimal("10000"),
            ))

        # All expenses
        all_expenses: List[Expense] = []
        all_expenses += may_2025(user_id)
        all_expenses += june_2025(user_id)
        all_expenses += july_2025(user_id)
        all_expenses += august_2025(user_id)
        all_expenses += september_2025(user_id)
        all_expenses += october_2025(user_id)
        all_expenses += november_2025(user_id)
        all_expenses += december_2025(user_id)
        all_expenses += january_2026(user_id)
        all_expenses += february_2026(user_id)
        all_expenses += march_2026(user_id)
        all_expenses += april_2026(user_id)

        db.add_all(all_expenses)
        await db.commit()

    total = len(all_expenses)
    total_spent = sum(float(e.amount) for e in all_expenses)
    print(f"✅  Demo user created: demo@spendwise.ai / Demo@1234")
    print(f"    Name: Arjun Sharma | College: Sharda University, Greater Noida")
    print(f"    {total} expenses | ₹{total_spent:,.0f} total over 12 months")
    print(f"    Avg monthly spend: ₹{total_spent/12:,.0f}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
