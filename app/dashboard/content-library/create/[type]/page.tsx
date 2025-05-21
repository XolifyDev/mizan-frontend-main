"use client";
import { useParams } from "next/navigation";
import CreateAnnouncementForm from "./forms/CreateAnnouncementForm";
import CreateImageForm from "./forms/CreateImageForm";
import CreatePreDesignedForm from "./forms/CreatePreDesignedForm";
import CreateWebsiteForm from "./forms/CreateWebsiteForm";
import CreateGoogleCalendarForm from "./forms/CreateGoogleCalendarForm";
import CreateDailyVerseForm from "./forms/CreateDailyVerseForm";
import CreateDailyHadithForm from "./forms/CreateDailyHadithForm";
import CreateDailyDuaForm from "./forms/CreateDailyDuaForm";
import CreateRamadanCountdownForm from "./forms/CreateRamadanCountdownForm";
import CreateEidCountdownForm from "./forms/CreateEidCountdownForm";
import CreateDaysCountdownForm from "./forms/CreateDaysCountdownForm";
import CreateTaraweehTimingsForm from "./forms/CreateTaraweehTimingsForm";

export default function CreateContentPage() {
  const { type } = useParams();
  switch (type) {
    case "announcement":
      return <CreateAnnouncementForm />;
    case "image":
      return <CreateImageForm />;
    case "predesigned":
      return <CreatePreDesignedForm />;
    case "website":
      return <CreateWebsiteForm />;
    case "google_calendar":
      return <CreateGoogleCalendarForm />;
    case "daily_verse":
      return <CreateDailyVerseForm />;
    case "daily_hadith":
      return <CreateDailyHadithForm />;
    case "daily_dua":
      return <CreateDailyDuaForm />;
    case "ramadan_countdown":
      return <CreateRamadanCountdownForm />;
    case "eid_countdown":
      return <CreateEidCountdownForm />;
    case "days_countdown":
      return <CreateDaysCountdownForm />;
    case "taraweeh_timings":
      return <CreateTaraweehTimingsForm />;
    default:
      return <div className="p-8 text-center text-red-600">Invalid content type</div>;
  }
} 