"use client";

import { createSubscribeRegistry } from "@/utils/registry";
import { ActivityDatabase } from "@/lib/activity/activity-schema";

export const dbUpgradeRegistry = createSubscribeRegistry<ActivityDatabase>();

export const subscribeToActivityDbUpgrade = dbUpgradeRegistry.subscribe;
