import React, { createContext, useContext } from "react";

export const SagaContext = createContext<Record<string, unknown>>({});

export const useSagaContext = () => useContext(SagaContext);
